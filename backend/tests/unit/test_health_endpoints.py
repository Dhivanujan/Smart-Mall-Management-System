from fastapi.testclient import TestClient


def test_health_liveness(client: TestClient) -> None:
	response = client.get("/health")
	assert response.status_code == 200
	assert response.json() == {"status": "ok"}


def test_health_readiness(client: TestClient) -> None:
	response = client.get("/health/ready")
	assert response.status_code == 200
	assert response.json() == {"status": "ready"}


def test_root(client: TestClient) -> None:
	response = client.get("/")
	assert response.status_code == 200
	assert "message" in response.json()
