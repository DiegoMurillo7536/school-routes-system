import json
import os
import sqlite3
import subprocess
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
VENV_BIN = BACKEND_DIR / ".venv" / "bin"
START_TIMEOUT_SECONDS = 30

# Runs in place of the API server. It reads the database at the moment it
# starts, so what it records shows how far the migration got by then. A missing
# table is recorded as null rather than raised, to report it as a failed
# assertion. The read-only mode stops it from creating the database itself.
API_STAND_IN = """\
import json
import sqlite3
import sys

database_path, observed_path = sys.argv[1:3]
try:
    connection = sqlite3.connect(f"file:{database_path}?mode=ro", uri=True)
    rows = connection.execute("SELECT version_num FROM alembic_version").fetchall()
    connection.close()
except sqlite3.OperationalError:
    rows = None
with open(observed_path, "w") as observed:
    json.dump(rows, observed)
"""


class TestStartScript:
    """Scenarios for the container start script."""

    @staticmethod
    def run_start_script(database, api_command):
        """Run entrypoint.sh against database, with api_command as the API server."""
        env = {
            **os.environ,
            "PATH": f"{VENV_BIN}{os.pathsep}{os.environ['PATH']}",
            "DATABASE_URL": f"sqlite:///{database}",
            "API_COMMAND": api_command,
        }
        return subprocess.run(
            ["sh", "entrypoint.sh"],
            cwd=BACKEND_DIR,
            env=env,
            capture_output=True,
            text=True,
            timeout=START_TIMEOUT_SECONDS,
        )

    def test_s5_start_script_applies_pending_migration_before_starting_the_api(
        self, tmp_path
    ):
        """The start script applies the pending migration before it starts the API."""
        # Arrange: a fresh database has the baseline migration pending.
        database = tmp_path / "start-script.db"
        observed = tmp_path / "api-observed.json"
        stand_in = tmp_path / "api_stand_in.py"
        stand_in.write_text(API_STAND_IN)
        api_command = f"{sys.executable} {stand_in} {database} {observed}"

        # Act
        result = self.run_start_script(database, api_command)

        # Assert
        script_output = result.stdout + result.stderr
        assert result.returncode == 0, script_output
        assert observed.exists(), f"the API command never ran\n{script_output}"
        rows_seen_by_api = json.loads(observed.read_text())
        assert rows_seen_by_api is not None, (
            f"the API started before alembic_version existed\n{script_output}"
        )
        assert len(rows_seen_by_api) == 1, script_output

    def test_s6_start_script_does_not_start_the_api_when_a_migration_fails(
        self, tmp_path
    ):
        """The start script exits with an error and skips the API when a migration fails."""
        # Arrange: the database is stamped with a revision that does not exist, so
        # a real `alembic upgrade head` fails.
        database = tmp_path / "start-script.db"
        api_ran_marker = tmp_path / "api-ran"
        connection = sqlite3.connect(database)
        connection.execute(
            "CREATE TABLE alembic_version (version_num VARCHAR(32) NOT NULL PRIMARY KEY)"
        )
        connection.execute("INSERT INTO alembic_version VALUES ('missing_revision')")
        connection.commit()
        connection.close()

        # Act
        result = self.run_start_script(database, f"touch {api_ran_marker}")

        # Assert
        script_output = result.stdout + result.stderr
        assert not api_ran_marker.exists(), (
            f"the API started after a failed migration\n{script_output}"
        )
        assert result.returncode != 0, script_output
