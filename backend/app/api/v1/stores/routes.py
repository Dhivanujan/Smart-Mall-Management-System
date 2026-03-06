from typing import List

from fastapi import APIRouter, HTTPException

from ....models.store import ProductSummary, StoreSummary


router = APIRouter()


# In-memory mock data for the public storefront.
_STORES: List[StoreSummary] = [
    StoreSummary(
        id=1,
        name="ElectroHub",
        category="Electronics",
        status="open",
        average_rating=4.6,
        current_footfall=120,
        current_occupancy_percent=68.0,
    ),
    StoreSummary(
        id=2,
        name="Fashion Lane",
        category="Fashion",
        status="open",
        average_rating=4.3,
        current_footfall=95,
        current_occupancy_percent=54.0,
    ),
    StoreSummary(
        id=3,
        name="Book Nook",
        category="Books",
        status="closed",
        average_rating=4.8,
        current_footfall=12,
        current_occupancy_percent=20.0,
    ),
]

_PRODUCTS_BY_STORE: dict[int, list[ProductSummary]] = {
    1: [
        ProductSummary(id=101, name="Noise-cancelling Headphones", price=199.99, category="Audio"),
        ProductSummary(id=102, name="4K Smart TV", price=899.0, category="TV"),
        ProductSummary(id=103, name="Gaming Laptop", price=1499.0, category="Computers"),
    ],
    2: [
        ProductSummary(id=201, name="Denim Jacket", price=79.99, category="Outerwear"),
        ProductSummary(id=202, name="Sneakers", price=59.0, category="Shoes"),
        ProductSummary(id=203, name="Everyday T-Shirt", price=19.0, category="Basics"),
    ],
    3: [
        ProductSummary(id=301, name="Bestselling Thriller", price=14.99, category="Fiction"),
        ProductSummary(id=302, name="Travel Guide", price=24.0, category="Travel"),
    ],
}


@router.get("/", summary="List mall stores")
async def list_stores() -> dict:
    """Return a public list of stores in the mall."""
    return {"stores": [s.model_dump() for s in _STORES]}


@router.get("/{store_id}", summary="Get store details")
async def get_store(store_id: int) -> dict:
    """Return details for a single store, including high-level metrics."""
    store = next((s for s in _STORES if s.id == store_id), None)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    products = _PRODUCTS_BY_STORE.get(store_id, [])

    today_metrics = {
        "today_revenue": 12500.0 if store_id == 1 else 8300.0,
        "today_transactions": 240 if store_id == 1 else 150,
        "conversion_rate_percent": 18.5 if store_id == 1 else 14.2,
    }

    return {
        "store": store.model_dump(),
        "products_sample": [p.model_dump() for p in products[:3]],
        "today_metrics": today_metrics,
    }


@router.get("/{store_id}/products", summary="List store products")
async def list_store_products(store_id: int) -> dict:
    """Return a mock product catalogue for a store."""
    store = next((s for s in _STORES if s.id == store_id), None)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    products = _PRODUCTS_BY_STORE.get(store_id, [])
    return {"store": store.model_dump(), "products": [p.model_dump() for p in products]}
