from fastapi.testclient import TestClient


def test_list_stores(client: TestClient) -> None:
	response = client.get("/api/v1/stores/")
	assert response.status_code == 200
	data = response.json()
	assert "stores" in data
	assert len(data["stores"]) > 0


def test_get_store_detail(client: TestClient) -> None:
	response = client.get("/api/v1/stores/1")
	assert response.status_code == 200
	data = response.json()
	assert data["store"]["id"] == 1
	assert "products_sample" in data
	assert "today_metrics" in data


def test_get_store_not_found(client: TestClient) -> None:
	response = client.get("/api/v1/stores/9999")
	assert response.status_code == 404


def test_list_store_products(client: TestClient) -> None:
	response = client.get("/api/v1/stores/1/products")
	assert response.status_code == 200
	data = response.json()
	assert "products" in data
	assert len(data["products"]) > 0
