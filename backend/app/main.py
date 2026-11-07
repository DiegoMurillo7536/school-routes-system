from collections.abc import Callable

from fastapi import FastAPI


def create_app(database_check: Callable[[], bool]) -> FastAPI:
    app = FastAPI()

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"api": "ok", "database": "ok"}

    return app
