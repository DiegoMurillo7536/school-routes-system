import json
import os
import shutil
import subprocess
import time
import uuid
from pathlib import Path

import httpx
import pytest
from pydantic import BaseModel

REPO_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_URL = "http://localhost:8080"
EXPECTED_SERVICES = ["backend", "db", "frontend"]
BUILD_TIMEOUT_SECONDS = 1200
COMMAND_TIMEOUT_SECONDS = 120
HTTP_WAIT_SECONDS = 60
HTTP_REQUEST_TIMEOUT_SECONDS = 10
POLL_INTERVAL_SECONDS = 1
DIAGNOSTIC_CHARACTERS = 4000


class ComposeStack(BaseModel):
    """A uniquely named Docker Compose project in a checkout folder."""

    project: str
    folder: Path
    up_attempted: bool = False

    def compose(
        self, *arguments: str, timeout: int = COMMAND_TIMEOUT_SECONDS
    ) -> subprocess.CompletedProcess[str]:
        """Run a docker compose command for this project in the checkout folder."""
        # The developer's COMPOSE_* variables must not change what gets started.
        env = {
            name: value
            for name, value in os.environ.items()
            if not name.startswith("COMPOSE_")
        }
        return subprocess.run(
            ["docker", "compose", "-p", self.project, *arguments],
            cwd=self.folder,
            env=env,
            capture_output=True,
            text=True,
            timeout=timeout,
        )

    def up(self) -> subprocess.CompletedProcess[str]:
        """Build and start the stack, recording the attempt so teardown cleans it up."""
        self.up_attempted = True
        return self.compose(
            "up", "--build", "--detach", "--wait", timeout=BUILD_TIMEOUT_SECONDS
        )

    def containers(self) -> list[dict]:
        """Return the project's containers, parsed from docker compose ps."""
        # --all keeps a container that exited visible to the assertions.
        result = self.compose("ps", "--all", "--format", "json")
        assert result.returncode == 0, result.stderr
        return [json.loads(line) for line in result.stdout.splitlines() if line]

    def logs(self) -> str:
        """Return the tail of the services' logs for failure messages."""
        result = self.compose("logs", "--no-color", "--tail", "50")
        return (result.stdout + result.stderr)[-DIAGNOSTIC_CHARACTERS:]

    def copy_fresh_checkout(self) -> None:
        """Copy the repository's tracked and unignored files into the folder."""
        # The list leaves out ignored files, so the copy has no .env, node_modules
        # or .venv, and the developer's own .env is never used.
        listed = subprocess.run(
            ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            check=True,
        )
        for relative_path in filter(None, listed.stdout.split("\0")):
            source = REPO_ROOT / relative_path
            if not os.path.lexists(source):
                continue  # Tracked, but deleted in the working tree.
            target = self.folder / relative_path
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target, follow_symlinks=False)

    @staticmethod
    def image_id(container_id: str) -> str:
        """Return the ID of the image a container runs from."""
        # Image names are not enough: two services built from one Dockerfile get
        # different names for the same image.
        result = subprocess.run(
            ["docker", "inspect", "--format", "{{.Image}}", container_id],
            capture_output=True,
            text=True,
            timeout=COMMAND_TIMEOUT_SECONDS,
        )
        assert result.returncode == 0, result.stderr
        return result.stdout.strip()

    def wait_for_status(self, path: str, status: int) -> httpx.Response:
        """Poll a path through the frontend until it answers status, or fail the test."""
        deadline = time.monotonic() + HTTP_WAIT_SECONDS
        last_seen = "no response"
        # trust_env=False keeps a developer's proxy settings away from localhost.
        with httpx.Client(
            trust_env=False, timeout=HTTP_REQUEST_TIMEOUT_SECONDS
        ) as client:
            while time.monotonic() < deadline:
                try:
                    response = client.get(f"{FRONTEND_URL}{path}")
                except httpx.HTTPError as error:
                    last_seen = repr(error)
                else:
                    if response.status_code == status:
                        return response
                    last_seen = f"{response.status_code}: {response.text[:500]}"
                time.sleep(POLL_INTERVAL_SECONDS)
        pytest.fail(
            f"GET {path} did not return {status} within {HTTP_WAIT_SECONDS}s, "
            f"last seen: {last_seen}\n{self.logs()}"
        )


@pytest.fixture
def stack(tmp_path):
    """Yield a uniquely named stack, removing it afterwards if it was started."""
    # Only teardown lives here: a failed start must be a test failure, not a
    # fixture error.
    compose_stack = ComposeStack(
        project=f"school-route-e2e-{uuid.uuid4().hex[:8]}",
        folder=tmp_path / "checkout",
    )
    yield compose_stack
    if compose_stack.up_attempted:
        result = compose_stack.compose(
            "down", "--rmi", "local", "--volumes", "--remove-orphans"
        )
        assert result.returncode == 0, (
            f"could not remove {compose_stack.project}\n{result.stderr}"
        )


class TestComposeStack:
    """Scenarios for the whole system started with Docker Compose."""

    @staticmethod
    def assert_health_body(response: httpx.Response, expected: dict[str, str]) -> None:
        """Assert that the response is the API's JSON and matches expected."""
        # A single-page fallback answers /health with 200 and index.html, so the
        # content type is checked first to report that clearly.
        content_type = response.headers.get("content-type", "")
        assert "application/json" in content_type, (
            f"/health did not reach the API, got {content_type}: {response.text[:500]}"
        )
        assert response.json() == expected

    @pytest.mark.e2e
    def test_s1_one_command_starts_the_connected_system_from_three_images(self, stack):
        """A fresh checkout starts three connected services, each from its own image."""
        # Arrange: a fresh checkout with .env copied from .env.example.
        stack.copy_fresh_checkout()
        env_example = stack.folder / ".env.example"
        assert env_example.is_file(), (
            ".env.example is missing from the repository, so a fresh checkout "
            "has nothing to copy to .env"
        )
        shutil.copy(env_example, stack.folder / ".env")

        # Act
        started = stack.up()

        # Assert: the three services are running.
        assert started.returncode == 0, (
            f"docker compose up failed\n"
            f"{(started.stdout + started.stderr)[-DIAGNOSTIC_CHARACTERS:]}\n"
            f"{stack.logs()}"
        )
        containers = stack.containers()
        assert sorted(c["Service"] for c in containers) == EXPECTED_SERVICES
        assert {c["Service"]: c["State"] for c in containers} == dict.fromkeys(
            EXPECTED_SERVICES, "running"
        )

        # Assert: each service runs from its own image.
        images = {c["Service"]: stack.image_id(c["ID"]) for c in containers}
        assert len(set(images.values())) == len(EXPECTED_SERVICES), images

        # Assert: the frontend is served.
        page = stack.wait_for_status("/", 200)
        assert "text/html" in page.headers.get("content-type", "")
        assert "<html" in page.text.lower()

        # Assert: nginx forwards to the backend, which reached the database.
        healthy = stack.wait_for_status("/health", 200)
        self.assert_health_body(healthy, {"api": "ok", "database": "ok"})

        # Assert: credentials cannot be committed by accident.
        ignored = subprocess.run(
            ["git", "check-ignore", "-q", ".env"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
        )
        assert ignored.returncode == 0, ".env is not ignored by git"

        # Assert: the health result comes from the real database, not from a stub.
        stopped = stack.compose("stop", "db")
        assert stopped.returncode == 0, stopped.stderr
        unavailable = stack.wait_for_status("/health", 503)
        self.assert_health_body(unavailable, {"api": "ok", "database": "unavailable"})
