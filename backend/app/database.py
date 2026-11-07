import os

from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.pool import NullPool

from app.constants import DatabaseConstants


class Database:
    """The database that DATABASE_URL points to."""

    def is_reachable(self) -> bool:
        """Try one connection to DATABASE_URL and report whether it opened."""
        engine = create_engine(
            os.environ["DATABASE_URL"],
            connect_args={"connect_timeout": DatabaseConstants.CONNECT_TIMEOUT_SECONDS},
            poolclass=NullPool,
        )
        try:
            with engine.connect():
                return True
        except OperationalError:
            return False
