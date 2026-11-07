import asyncio

import httpx


def get_health(api) -> httpx.Response:
    async def send_request() -> httpx.Response:
        transport = httpx.ASGITransport(app=api)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://testserver"
        ) as client:
            return await client.get("/health")

    return asyncio.run(send_request())


def test_s2_health_reports_api_and_database_ok_when_database_is_reachable():
    # Imported here so a missing app is reported as this test failing,
    # not as a collection error.
    from app.main import create_app

    # Arrange: database_check is the seam that replaces a live database.
    api = create_app(database_check=lambda: True)

    # Act
    response = get_health(api)

    # Assert
    assert response.status_code == 200
    assert response.json() == {"api": "ok", "database": "ok"}


def test_s3_health_reports_database_unavailable_when_database_is_unreachable():
    from app.main import create_app

    # Arrange: a failing database_check stands in for an unreachable database.
    api = create_app(database_check=lambda: False)

    # Act
    response = get_health(api)

    # Assert
    assert response.status_code == 503
    assert response.json() == {"api": "ok", "database": "unavailable"}
