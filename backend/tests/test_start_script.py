import json
import os
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


def test_s5_start_script_applies_pending_migration_before_starting_the_api(tmp_path):
    # Arrange: a fresh database has the baseline migration pending.
    database = tmp_path / "start-script.db"
    observed = tmp_path / "api-observed.json"
    stand_in = tmp_path / "api_stand_in.py"
    stand_in.write_text(API_STAND_IN)
    env = {
        **os.environ,
        "PATH": f"{VENV_BIN}{os.pathsep}{os.environ['PATH']}",
        "DATABASE_URL": f"sqlite:///{database}",
        "API_COMMAND": f"{sys.executable} {stand_in} {database} {observed}",
    }

    # Act
    result = subprocess.run(
        ["sh", "entrypoint.sh"],
        cwd=BACKEND_DIR,
        env=env,
        capture_output=True,
        text=True,
        timeout=START_TIMEOUT_SECONDS,
    )

    # Assert
    script_output = result.stdout + result.stderr
    assert result.returncode == 0, script_output
    assert observed.exists(), f"the API command never ran\n{script_output}"
    rows_seen_by_api = json.loads(observed.read_text())
    assert rows_seen_by_api is not None, (
        f"the API started before alembic_version existed\n{script_output}"
    )
    assert len(rows_seen_by_api) == 1, script_output
