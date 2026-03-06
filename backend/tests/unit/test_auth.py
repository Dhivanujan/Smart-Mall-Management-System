from fastapi.testclient import TestClient


def test_login_success(client: TestClient) -> None:
	response = client.post(
		"/api/v1/auth/login",
		data={"username": "admin@example.com", "password": "admin123"},
	)
	assert response.status_code == 200
	data = response.json()
	assert "access_token" in data
	assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client: TestClient) -> None:
	response = client.post(
		"/api/v1/auth/login",
		data={"username": "admin@example.com", "password": "wrong"},
	)
	assert response.status_code == 401


def test_me_unauthenticated(client: TestClient) -> None:
	response = client.get("/api/v1/auth/me")
	assert response.status_code == 401


def test_me_authenticated(client: TestClient) -> None:
	login_res = client.post(
		"/api/v1/auth/login",
		data={"username": "admin@example.com", "password": "admin123"},
	)
	token = login_res.json()["access_token"]

	response = client.get(
		"/api/v1/auth/me",
		headers={"Authorization": f"Bearer {token}"},
	)
	assert response.status_code == 200
	assert response.json()["username"] == "admin@example.com"
