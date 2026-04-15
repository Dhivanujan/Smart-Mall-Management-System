"""Favorites API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user
from app.db.models.favorite import FavoriteDocument
from app.db.models.store import StoreDocument
from app.db.models.offer import OfferDocument

router = APIRouter(prefix="/favorites", tags=["favorites"])


async def _next_favorite_id() -> int:
    last = await FavoriteDocument.find().sort("-favorite_id").first_or_none()
    return (last.favorite_id + 1) if last else 1


@router.get("/")
async def list_my_favorites(
    current_user: User = Depends(get_current_active_user),
) -> dict:
    docs = await FavoriteDocument.find({"username": current_user.username}).to_list()
    store_ids = [d.item_id for d in docs if d.item_type == "store"]
    offer_ids = [d.item_id for d in docs if d.item_type == "offer"]

    stores = await StoreDocument.find({"store_id": {"$in": store_ids}}).to_list() if store_ids else []
    offers = await OfferDocument.find({"offer_id": {"$in": offer_ids}}).to_list() if offer_ids else []

    return {
        "stores": [
            {
                "id": s.store_id,
                "name": s.name,
                "category": s.category,
                "status": s.status,
                "average_rating": s.average_rating,
            }
            for s in stores
        ],
        "offers": [
            {
                "id": o.offer_id,
                "store_id": o.store_id,
                "title": o.title,
                "discount_percent": o.discount_percent,
                "status": o.status,
            }
            for o in offers
        ],
        "store_ids": store_ids,
        "offer_ids": offer_ids,
    }


@router.post("/stores/{store_id}")
async def add_store_favorite(
    store_id: int,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    existing = await FavoriteDocument.find_one(
        {"username": current_user.username, "item_type": "store", "item_id": store_id}
    )
    if existing is not None:
        return {"message": "Store already in favorites"}

    doc = FavoriteDocument(
        favorite_id=await _next_favorite_id(),
        username=current_user.username,
        item_type="store",
        item_id=store_id,
    )
    await doc.insert()
    return {"message": "Store added to favorites"}


@router.delete("/stores/{store_id}")
async def remove_store_favorite(
    store_id: int,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    doc = await FavoriteDocument.find_one(
        {"username": current_user.username, "item_type": "store", "item_id": store_id}
    )
    if doc:
        await doc.delete()
    return {"message": "Store removed from favorites"}


@router.post("/offers/{offer_id}")
async def add_offer_favorite(
    offer_id: int,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    existing = await FavoriteDocument.find_one(
        {"username": current_user.username, "item_type": "offer", "item_id": offer_id}
    )
    if existing is not None:
        return {"message": "Offer already in favorites"}

    doc = FavoriteDocument(
        favorite_id=await _next_favorite_id(),
        username=current_user.username,
        item_type="offer",
        item_id=offer_id,
    )
    await doc.insert()
    return {"message": "Offer added to favorites"}


@router.delete("/offers/{offer_id}")
async def remove_offer_favorite(
    offer_id: int,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    doc = await FavoriteDocument.find_one(
        {"username": current_user.username, "item_type": "offer", "item_id": offer_id}
    )
    if doc:
        await doc.delete()
    return {"message": "Offer removed from favorites"}
