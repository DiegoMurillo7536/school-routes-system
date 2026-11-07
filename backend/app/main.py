from collections.abc import Callable

from fastapi import FastAPI, Response


def create_app(database_check: Callable[[], bool]) -> FastAPI:
    app = FastAPI()

    @app.get("/health")
    def health(response: Response) -> dict[str, str]:
        if database_check():
            return {"api": "ok", "database": "ok"}
        response.status_code = 503
        return {"api": "ok", "database": "unavailable"}

    return app
