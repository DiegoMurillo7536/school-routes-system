from collections.abc import Callable

from fastapi import FastAPI, Response


def create_app(database_check: Callable[[], bool]) -> FastAPI:
    """Build the API, using database_check to probe the database for /health."""
    app = FastAPI()

    @app.get("/health")
    def health(response: Response) -> dict[str, str]:
        """Report API and database status, answering 503 when the database is down."""
        if database_check():
            return {"api": "ok", "database": "ok"}
        response.status_code = 503
        return {"api": "ok", "database": "unavailable"}

    return app
