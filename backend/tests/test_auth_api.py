from fastapi.testclient import TestClient

from src.main import app


def test_auth_me_requires_token() -> None:
    client = TestClient(app)
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_register_validation_returns_plain_detail_string() -> None:
    client = TestClient(app)
    r = client.post("/auth/register", json={"email": "not-an-email", "password": "1234"})
    assert r.status_code == 422
    data = r.json()
    assert isinstance(data.get("detail"), str)
    assert "email" in data["detail"].lower() or "корректн" in data["detail"].lower()

    r2 = client.post("/auth/register", json={"email": "a@b.co", "password": "12"})
    assert r2.status_code == 422
    assert "4" in r2.json()["detail"]
