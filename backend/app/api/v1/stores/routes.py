from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from ....auth.schemas.users import User
from ....auth.services.security import require_admin, require_super_admin
from ....models.store import ProductSummary, StoreSummary


router = APIRouter()

_next_store_id = 11
_next_product_id = 1001


# Extended store data with address, working hours, location
class StoreExtra:
    def __init__(
        self,
        store: StoreSummary,
        address: str,
        working_hours: str,
        floor: int,
        map_x: int,
        map_y: int,
        description: str,
    ):
        self.store = store
        self.address = address
        self.working_hours = working_hours
        self.floor = floor
        self.map_x = map_x
        self.map_y = map_y
        self.description = description


# In-memory mock data for the public storefront.
_STORES: List[StoreSummary] = [
    StoreSummary(id=1, name="ElectroHub", category="Electronics", status="open", average_rating=4.6, current_footfall=120, current_occupancy_percent=68.0),
    StoreSummary(id=2, name="Fashion Lane", category="Fashion", status="open", average_rating=4.3, current_footfall=95, current_occupancy_percent=54.0),
    StoreSummary(id=3, name="Book Nook", category="Books", status="closed", average_rating=4.8, current_footfall=12, current_occupancy_percent=20.0),
    StoreSummary(id=4, name="Food Plaza", category="Food", status="open", average_rating=4.2, current_footfall=200, current_occupancy_percent=82.0),
    StoreSummary(id=5, name="Gadget World", category="Electronics", status="open", average_rating=4.1, current_footfall=78, current_occupancy_percent=45.0),
    StoreSummary(id=6, name="Style Studio", category="Fashion", status="open", average_rating=4.5, current_footfall=88, current_occupancy_percent=52.0),
    StoreSummary(id=7, name="Fresh Mart", category="Food", status="open", average_rating=4.0, current_footfall=150, current_occupancy_percent=75.0),
    StoreSummary(id=8, name="Sports Arena", category="Sports", status="open", average_rating=4.4, current_footfall=65, current_occupancy_percent=38.0),
    StoreSummary(id=9, name="Home Comforts", category="Home & Living", status="open", average_rating=4.7, current_footfall=55, current_occupancy_percent=32.0),
    StoreSummary(id=10, name="Toy Kingdom", category="Entertainment", status="maintenance", average_rating=4.3, current_footfall=0, current_occupancy_percent=0.0),
]

_STORE_EXTRAS: dict[int, dict] = {
    1: {"address": "Ground Floor, Zone A, Unit 101", "working_hours": "10:00 AM - 9:00 PM", "floor": 1, "map_x": 20, "map_y": 30, "description": "Your one-stop shop for electronics and gadgets"},
    2: {"address": "First Floor, Zone B, Unit 205", "working_hours": "10:00 AM - 9:00 PM", "floor": 2, "map_x": 60, "map_y": 40, "description": "Trendy fashion for all ages"},
    3: {"address": "Second Floor, Zone C, Unit 310", "working_hours": "10:00 AM - 8:00 PM", "floor": 3, "map_x": 40, "map_y": 70, "description": "Books, stationery, and more"},
    4: {"address": "Ground Floor, Zone D, Unit 150", "working_hours": "8:00 AM - 10:00 PM", "floor": 1, "map_x": 50, "map_y": 80, "description": "Multi-cuisine food court"},
    5: {"address": "Ground Floor, Zone A, Unit 105", "working_hours": "10:00 AM - 9:00 PM", "floor": 1, "map_x": 25, "map_y": 35, "description": "Latest gadgets and accessories"},
    6: {"address": "First Floor, Zone B, Unit 210", "working_hours": "10:00 AM - 9:00 PM", "floor": 2, "map_x": 65, "map_y": 45, "description": "Premium fashion brands"},
    7: {"address": "Ground Floor, Zone D, Unit 155", "working_hours": "8:00 AM - 10:00 PM", "floor": 1, "map_x": 55, "map_y": 85, "description": "Fresh groceries and daily needs"},
    8: {"address": "Second Floor, Zone A, Unit 301", "working_hours": "9:00 AM - 9:00 PM", "floor": 3, "map_x": 15, "map_y": 50, "description": "Sports equipment and activewear"},
    9: {"address": "First Floor, Zone C, Unit 250", "working_hours": "10:00 AM - 8:00 PM", "floor": 2, "map_x": 45, "map_y": 55, "description": "Home decor and furnishings"},
    10: {"address": "Third Floor, Zone B, Unit 401", "working_hours": "10:00 AM - 8:00 PM", "floor": 4, "map_x": 70, "map_y": 30, "description": "Toys and entertainment for kids"},
}

_PRODUCTS_BY_STORE: dict[int, list[ProductSummary]] = {
    1: [
        ProductSummary(id=101, name="Noise-cancelling Headphones", price=199.99, category="Audio"),
        ProductSummary(id=102, name="4K Smart TV", price=899.0, category="TV"),
        ProductSummary(id=103, name="Gaming Laptop", price=1499.0, category="Computers"),
        ProductSummary(id=104, name="Wireless Mouse", price=29.99, category="Accessories"),
        ProductSummary(id=105, name="Bluetooth Speaker", price=79.99, category="Audio"),
    ],
    2: [
        ProductSummary(id=201, name="Denim Jacket", price=79.99, category="Outerwear"),
        ProductSummary(id=202, name="Sneakers", price=59.0, category="Shoes"),
        ProductSummary(id=203, name="Everyday T-Shirt", price=19.0, category="Basics"),
        ProductSummary(id=204, name="Summer Dress", price=49.99, category="Dresses"),
        ProductSummary(id=205, name="Leather Belt", price=34.99, category="Accessories"),
    ],
    3: [
        ProductSummary(id=301, name="Bestselling Thriller", price=14.99, category="Fiction"),
        ProductSummary(id=302, name="Travel Guide", price=24.0, category="Travel"),
        ProductSummary(id=303, name="Cookbook Masterclass", price=29.99, category="Cooking"),
    ],
    4: [
        ProductSummary(id=401, name="Combo Meal", price=12.99, category="Meals"),
        ProductSummary(id=402, name="Pizza Slice", price=4.99, category="Fast Food"),
        ProductSummary(id=403, name="Fresh Juice", price=5.99, category="Beverages"),
    ],
    5: [
        ProductSummary(id=501, name="Smart Watch", price=249.0, category="Wearables"),
        ProductSummary(id=502, name="Tablet 10 inch", price=349.0, category="Tablets"),
        ProductSummary(id=503, name="USB-C Hub", price=45.0, category="Accessories"),
    ],
    6: [
        ProductSummary(id=601, name="Designer Handbag", price=199.0, category="Bags"),
        ProductSummary(id=602, name="Silk Scarf", price=59.0, category="Accessories"),
    ],
    7: [
        ProductSummary(id=701, name="Organic Fruit Box", price=15.99, category="Fruits"),
        ProductSummary(id=702, name="Fresh Bread", price=3.99, category="Bakery"),
    ],
    8: [
        ProductSummary(id=801, name="Running Shoes", price=89.99, category="Footwear"),
        ProductSummary(id=802, name="Yoga Mat", price=29.99, category="Fitness"),
    ],
    9: [
        ProductSummary(id=901, name="Table Lamp", price=45.0, category="Lighting"),
        ProductSummary(id=902, name="Throw Pillow Set", price=35.0, category="Decor"),
    ],
    10: [
        ProductSummary(id=1001, name="LEGO Set", price=69.99, category="Building"),
        ProductSummary(id=1002, name="Board Game Collection", price=39.99, category="Games"),
    ],
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
    stores = _STORES
    if search:
        search_lower = search.lower()
        stores = [s for s in stores if search_lower in s.name.lower() or search_lower in s.category.lower()]
    if category:
        stores = [s for s in stores if s.category.lower() == category.lower()]
    if status:
        stores = [s for s in stores if s.status == status]
    categories = sorted({s.category for s in _STORES})
    return {"stores": [s.model_dump() for s in stores], "categories": categories}


@router.get("/map", summary="Get mall map data")
async def get_mall_map() -> dict:
    """Return store locations for the interactive mall map."""
    map_data = []
    for store in _STORES:
        extra = _STORE_EXTRAS.get(store.id, {})
        map_data.append({
            **store.model_dump(),
            "floor": extra.get("floor", 1),
            "map_x": extra.get("map_x", 50),
            "map_y": extra.get("map_y", 50),
        })
    return {
        "stores": map_data,
        "floors": sorted({e.get("floor", 1) for e in _STORE_EXTRAS.values()}),
    }


@router.get("/{store_id}", summary="Get store details")
async def get_store(store_id: int) -> dict:
    """Return details for a single store, including working hours and offers."""
    store = next((s for s in _STORES if s.id == store_id), None)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    products = _PRODUCTS_BY_STORE.get(store_id, [])
    extra = _STORE_EXTRAS.get(store_id, {})

    today_metrics = {
        "today_revenue": 12500.0 if store_id == 1 else 8300.0,
        "today_transactions": 240 if store_id == 1 else 150,
        "conversion_rate_percent": 18.5 if store_id == 1 else 14.2,
    }

    return {
        "store": store.model_dump(),
        "address": extra.get("address", ""),
        "working_hours": extra.get("working_hours", "10:00 AM - 9:00 PM"),
        "description": extra.get("description", ""),
        "floor": extra.get("floor", 1),
        "products_sample": [p.model_dump() for p in products[:5]],
        "today_metrics": today_metrics,
    }


@router.get("/{store_id}/products", summary="List store products")
async def list_store_products(store_id: int, search: str | None = None) -> dict:
    """Return a product catalogue for a store."""
    store = next((s for s in _STORES if s.id == store_id), None)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    products = _PRODUCTS_BY_STORE.get(store_id, [])
    if search:
        search_lower = search.lower()
        products = [p for p in products if search_lower in p.name.lower() or search_lower in p.category.lower()]
    return {"store": store.model_dump(), "products": [p.model_dump() for p in products]}


# ── Admin product management ───────────────────────────────────────

@router.post("/{store_id}/products", summary="Add product to store")
async def add_product(
    store_id: int,
    body: CreateProductRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    global _next_product_id
    store = next((s for s in _STORES if s.id == store_id), None)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    product = ProductSummary(id=_next_product_id, name=body.name, price=body.price, category=body.category)
    _next_product_id += 1
    if store_id not in _PRODUCTS_BY_STORE:
        _PRODUCTS_BY_STORE[store_id] = []
    _PRODUCTS_BY_STORE[store_id].append(product)
    return {"message": "Product added", "product": product.model_dump()}


@router.put("/{store_id}/products/{product_id}", summary="Update product")
async def update_product(
    store_id: int,
    product_id: int,
    body: UpdateProductRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    products = _PRODUCTS_BY_STORE.get(store_id, [])
    product = next((p for p in products if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if body.name is not None:
        product.name = body.name
    if body.price is not None:
        product.price = body.price
    if body.category is not None:
        product.category = body.category
    return {"message": "Product updated", "product": product.model_dump()}


@router.delete("/{store_id}/products/{product_id}", summary="Delete product")
async def delete_product(
    store_id: int,
    product_id: int,
    current_user: User = Depends(require_admin),
) -> dict:
    products = _PRODUCTS_BY_STORE.get(store_id, [])
    for i, p in enumerate(products):
        if p.id == product_id:
            products.pop(i)
            return {"message": "Product deleted"}
    raise HTTPException(status_code=404, detail="Product not found")


# ── Super Admin store management ────────────────────────────────────

@router.post("/admin/create", summary="Create new store")
async def admin_create_store(
    body: CreateStoreRequest,
    current_user: User = Depends(require_super_admin),
) -> dict:
    global _next_store_id
    store = StoreSummary(
        id=_next_store_id,
        name=body.name,
        category=body.category,
        status="open",
        average_rating=0.0,
        current_footfall=0,
        current_occupancy_percent=0.0,
    )
    _next_store_id += 1
    _STORES.append(store)
    _STORE_EXTRAS[store.id] = {
        "address": body.address,
        "working_hours": body.working_hours,
        "floor": 1,
        "map_x": 50,
        "map_y": 50,
        "description": body.description,
    }
    _PRODUCTS_BY_STORE[store.id] = []
    return {"message": "Store created", "store": store.model_dump()}


@router.put("/admin/{store_id}", summary="Update store")
async def admin_update_store(
    store_id: int,
    body: UpdateStoreRequest,
    current_user: User = Depends(require_super_admin),
) -> dict:
    store = next((s for s in _STORES if s.id == store_id), None)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    if body.name is not None:
        store.name = body.name
    if body.category is not None:
        store.category = body.category
    if body.status is not None:
        store.status = body.status
    extra = _STORE_EXTRAS.get(store_id, {})
    if body.address is not None:
        extra["address"] = body.address
    if body.working_hours is not None:
        extra["working_hours"] = body.working_hours
    if body.description is not None:
        extra["description"] = body.description
    _STORE_EXTRAS[store_id] = extra
    return {"message": "Store updated", "store": store.model_dump()}


@router.delete("/admin/{store_id}", summary="Remove store")
async def admin_remove_store(
    store_id: int,
    current_user: User = Depends(require_super_admin),
) -> dict:
    store = next((s for s in _STORES if s.id == store_id), None)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    store.status = "suspended"
    return {"message": f"Store {store.name} suspended"}
