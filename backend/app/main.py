from collections.abc import Callable

from fastapi import FastAPI, Response


class SchoolRouteApi:
    """The HTTP API, which probes the database through an injected check."""

    def __init__(self, database_check: Callable[[], bool]) -> None:
        """Keep database_check to probe the database for /health."""
        self.database_check = database_check

    def build(self) -> FastAPI:
        """Build the FastAPI app, with health as the /health route handler."""
        app = FastAPI()
        app.get("/health")(self.health)
        return app

    def health(self, response: Response) -> dict[str, str]:
        """Report API and database status, answering 503 when the database is down."""
        if self.database_check():
            return {"api": "ok", "database": "ok"}
        response.status_code = 503
        return {"api": "ok", "database": "unavailable"}
