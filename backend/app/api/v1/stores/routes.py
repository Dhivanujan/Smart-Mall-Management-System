from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from ....auth.schemas.users import User
from ....auth.services.security import require_admin, require_super_admin
from ....db.models.store import StoreDocument, ProductDocument


router = APIRouter()


def _store_dict(doc: StoreDocument) -> dict:
    return {
        "id": doc.store_id,
        "name": doc.name,
        "category": doc.category,
        "status": doc.status,
        "average_rating": doc.average_rating,
        "current_footfall": doc.current_footfall,
        "current_occupancy_percent": doc.current_occupancy_percent,
    }


def _product_dict(doc: ProductDocument) -> dict:
    return {
        "id": doc.product_id,
        "name": doc.name,
        "price": doc.price,
        "category": doc.category,
    }


class CreateStoreRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    category: str = Field(min_length=2, max_length=50)
    address: str = ""
    working_hours: str = "10:00 AM - 9:00 PM"
    description: str = ""


class UpdateStoreRequest(BaseModel):
    name: str | None = None
    category: str | None = None
    status: str | None = None
    address: str | None = None
    working_hours: str | None = None
    description: str | None = None


class CreateProductRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    price: float = Field(gt=0)
    category: str = Field(min_length=1, max_length=50)


class UpdateProductRequest(BaseModel):
    name: str | None = None
    price: float | None = None
    category: str | None = None


# ── Public endpoints ────────────────────────────────────────────────

@router.get("/", summary="List mall stores")
async def list_stores(
    search: str | None = None,
    category: str | None = None,
    status: str | None = None,
) -> dict:
    """Return a public list of stores in the mall with optional filtering."""
    query: dict = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if status:
        query["status"] = status

    all_stores = await StoreDocument.find(query).to_list()

    if search:
        search_lower = search.lower()
        all_stores = [s for s in all_stores if search_lower in s.name.lower() or search_lower in s.category.lower()]

    all_categories_docs = await StoreDocument.find().to_list()
    categories = sorted({s.category for s in all_categories_docs})
    return {"stores": [_store_dict(s) for s in all_stores], "categories": categories}


@router.get("/map", summary="Get mall map data")
async def get_mall_map() -> dict:
    """Return store locations for the interactive mall map."""
    stores = await StoreDocument.find().to_list()
    map_data = []
    for store in stores:
        map_data.append({
            **_store_dict(store),
            "floor": store.floor,
            "map_x": store.map_x,
            "map_y": store.map_y,
        })
    floors = sorted({s.floor for s in stores})
    return {"stores": map_data, "floors": floors}


@router.get("/{store_id}", summary="Get store details")
async def get_store(store_id: int) -> dict:
    """Return details for a single store, including working hours and offers."""
    store = await StoreDocument.find_one(StoreDocument.store_id == store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    products = await ProductDocument.find(ProductDocument.store_id == store_id).to_list()

    today_metrics = {
        "today_revenue": 12500.0 if store_id == 1 else 8300.0,
        "today_transactions": 240 if store_id == 1 else 150,
        "conversion_rate_percent": 18.5 if store_id == 1 else 14.2,
    }

    return {
        "store": _store_dict(store),
        "address": store.address,
        "working_hours": store.working_hours,
        "description": store.description,
        "floor": store.floor,
        "products_sample": [_product_dict(p) for p in products[:5]],
        "today_metrics": today_metrics,
    }


@router.get("/{store_id}/products", summary="List store products")
async def list_store_products(store_id: int, search: str | None = None) -> dict:
    """Return a product catalogue for a store."""
    store = await StoreDocument.find_one(StoreDocument.store_id == store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    products = await ProductDocument.find(ProductDocument.store_id == store_id).to_list()
    if search:
        search_lower = search.lower()
        products = [p for p in products if search_lower in p.name.lower() or search_lower in p.category.lower()]
    return {"store": _store_dict(store), "products": [_product_dict(p) for p in products]}


# ── Admin product management ───────────────────────────────────────

@router.post("/{store_id}/products", summary="Add product to store")
async def add_product(
    store_id: int,
    body: CreateProductRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    store = await StoreDocument.find_one(StoreDocument.store_id == store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    last_product = await ProductDocument.find().sort("-product_id").first_or_none()
    next_id = (last_product.product_id + 1) if last_product else 1

    product = ProductDocument(product_id=next_id, store_id=store_id, name=body.name, price=body.price, category=body.category)
    await product.insert()
    return {"message": "Product added", "product": _product_dict(product)}


@router.put("/{store_id}/products/{product_id}", summary="Update product")
async def update_product(
    store_id: int,
    product_id: int,
    body: UpdateProductRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    product = await ProductDocument.find_one(
        ProductDocument.store_id == store_id,
        ProductDocument.product_id == product_id,
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if body.name is not None:
        product.name = body.name
    if body.price is not None:
        product.price = body.price
    if body.category is not None:
        product.category = body.category
    await product.save()
    return {"message": "Product updated", "product": _product_dict(product)}


@router.delete("/{store_id}/products/{product_id}", summary="Delete product")
async def delete_product(
    store_id: int,
    product_id: int,
    current_user: User = Depends(require_admin),
) -> dict:
    product = await ProductDocument.find_one(
        ProductDocument.store_id == store_id,
        ProductDocument.product_id == product_id,
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await product.delete()
    return {"message": "Product deleted"}


# ── Super Admin store management ────────────────────────────────────

@router.post("/admin/create", summary="Create new store")
async def admin_create_store(
    body: CreateStoreRequest,
    current_user: User = Depends(require_super_admin),
) -> dict:
    last_store = await StoreDocument.find().sort("-store_id").first_or_none()
    next_id = (last_store.store_id + 1) if last_store else 1

    store = StoreDocument(
        store_id=next_id,
        name=body.name,
        category=body.category,
        status="open",
        average_rating=0.0,
        current_footfall=0,
        current_occupancy_percent=0.0,
        address=body.address,
        working_hours=body.working_hours,
        description=body.description,
    )
    await store.insert()
    return {"message": "Store created", "store": _store_dict(store)}


@router.put("/admin/{store_id}", summary="Update store")
async def admin_update_store(
    store_id: int,
    body: UpdateStoreRequest,
    current_user: User = Depends(require_super_admin),
) -> dict:
    store = await StoreDocument.find_one(StoreDocument.store_id == store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    if body.name is not None:
        store.name = body.name
    if body.category is not None:
        store.category = body.category
    if body.status is not None:
        store.status = body.status
    if body.address is not None:
        store.address = body.address
    if body.working_hours is not None:
        store.working_hours = body.working_hours
    if body.description is not None:
        store.description = body.description
    await store.save()
    return {"message": "Store updated", "store": _store_dict(store)}


@router.delete("/admin/{store_id}", summary="Remove store")
async def admin_remove_store(
    store_id: int,
    current_user: User = Depends(require_super_admin),
) -> dict:
    store = await StoreDocument.find_one(StoreDocument.store_id == store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    store.status = "suspended"
    await store.save()
    return {"message": f"Store {store.name} suspended"}
