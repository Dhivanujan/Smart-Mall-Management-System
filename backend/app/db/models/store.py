"""Store & product document models."""

from __future__ import annotations

from beanie import Document
from pydantic import Field


class StoreDocument(Document):
    store_id: int
    name: str
    category: str
    status: str = "open"
    average_rating: float = 0.0
    current_footfall: int = 0
    current_occupancy_percent: float = 0.0
    address: str = ""
    working_hours: str = "10:00 AM - 9:00 PM"
    floor: int = 1
    map_x: int = 50
    map_y: int = 50
    description: str = ""

    class Settings:
        name = "stores"
        indexes = [
            "store_id",
            "category",
        ]


class ProductDocument(Document):
    product_id: int
    store_id: int
    name: str
    price: float
    category: str

    class Settings:
        name = "products"
        indexes = [
            "product_id",
            "store_id",
        ]
