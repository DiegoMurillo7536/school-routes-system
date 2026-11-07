import os
import shlex
import subprocess
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
RECURSION_GUARD = "S7_INSIDE_MAKE_TEST"
INHERITED_MAKE_VARIABLES = (
    "MAKEFLAGS",
    "MFLAGS",
    "MAKELEVEL",
    "MAKEOVERRIDES",
    "BACKEND_TEST",
    "FRONTEND_TEST",
)


def run_make(*arguments: str) -> subprocess.CompletedProcess[str]:
    """Run make at the repo root, isolated from any outer make's variables."""
    # This test also runs under the real "make test", so the outer make's
    # variables must not leak in. The guard stops a Makefile that ignores the
    # overrides from running pytest inside pytest forever.
    env = {
        name: value
        for name, value in os.environ.items()
        if name not in INHERITED_MAKE_VARIABLES
    }
    env[RECURSION_GUARD] = "1"
    return subprocess.run(
        ["make", *arguments],
        cwd=REPO_ROOT,
        env=env,
        capture_output=True,
        text=True,
    )


def stand_in_suite(marker: Path, exit_code: int) -> str:
    """Return a shell command that touches marker and exits with exit_code."""
    # The subshell keeps "exit" from ending a recipe that runs both suites.
    return f"(touch {shlex.quote(str(marker))}; exit {exit_code})"


@pytest.mark.parametrize(
    ("backend_exit", "frontend_exit", "make_succeeds"),
    [
        pytest.param(0, 0, True, id="both-pass"),
        pytest.param(1, 0, False, id="backend-fails"),
        pytest.param(0, 1, False, id="frontend-fails"),
    ],
)
def test_s7_make_test_runs_both_suites_and_fails_if_either_fails(
    tmp_path, backend_exit, frontend_exit, make_succeeds
):
    """make test runs both real suites by default and fails if either fails."""
    if RECURSION_GUARD in os.environ:
        pytest.fail("make test ignored BACKEND_TEST and ran pytest again")

    # Arrange: cheap stand-ins replace the suites, so pytest does not run itself.
    backend_ran = tmp_path / "backend-ran"
    frontend_ran = tmp_path / "frontend-ran"

    # Act
    result = run_make(
        "test",
        f"BACKEND_TEST={stand_in_suite(backend_ran, backend_exit)}",
        f"FRONTEND_TEST={stand_in_suite(frontend_ran, frontend_exit)}",
    )
    dry_run = run_make("-n", "test")

    # Assert
    make_output = result.stdout + result.stderr
    assert backend_ran.exists(), make_output
    assert frontend_ran.exists(), make_output
    assert (result.returncode == 0) == make_succeeds, make_output

    # The default commands must be the real suites, each from its own folder.
    assert dry_run.returncode == 0, dry_run.stderr
    default_commands = dry_run.stdout.splitlines()
    assert any(
        "backend" in line and "pytest" in line for line in default_commands
    ), dry_run.stdout
    assert any(
        "frontend" in line and "npm test" in line for line in default_commands
    ), dry_run.stdout
