import os

from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.pool import NullPool

CONNECT_TIMEOUT_SECONDS = 2


def database_is_reachable() -> bool:
    engine = create_engine(
        os.environ["DATABASE_URL"],
        connect_args={"connect_timeout": CONNECT_TIMEOUT_SECONDS},
        poolclass=NullPool,
    )
    try:
        with engine.connect():
            return True
    except OperationalError:
        return False
