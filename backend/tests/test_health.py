import asyncio

import httpx

from app.main import create_app


def get_health(api) -> httpx.Response:
    """Send GET /health to the app in process and return the response."""
    async def send_request() -> httpx.Response:
        """Request /health from the app through an ASGI transport."""
        transport = httpx.ASGITransport(app=api)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://testserver"
        ) as client:
            return await client.get("/health")

    return asyncio.run(send_request())


def test_s2_health_reports_api_and_database_ok_when_database_is_reachable():
    """/health answers 200 with both statuses ok when the database is reachable."""
    # Arrange: database_check is the seam that replaces a live database.
    api = create_app(database_check=lambda: True)

    # Act
    response = get_health(api)

    # Assert
    assert response.status_code == 200
    assert response.json() == {"api": "ok", "database": "ok"}


def test_s3_health_reports_database_unavailable_when_database_is_unreachable():
    """/health answers 503 with the database unavailable when it is unreachable."""
    # Arrange: a failing database_check stands in for an unreachable database.
    api = create_app(database_check=lambda: False)

    # Act
    response = get_health(api)

    # Assert
    assert response.status_code == 503
    assert response.json() == {"api": "ok", "database": "unavailable"}
