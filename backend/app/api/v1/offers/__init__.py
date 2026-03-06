"""Offers API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user, require_admin
from app.models.offer import OfferStore

router = APIRouter(prefix="/offers", tags=["offers"])

_store = OfferStore()

# Seed demo offers
_store.create(1, "Summer Electronics Sale", "Get amazing discounts on all electronics", 25.0, max_redemptions=100)
_store.create(1, "Buy 2 Get 1 Free", "On select accessories", 33.0)
_store.create(2, "Fashion Week Special", "Flat discount on new arrivals", 20.0)
_store.create(2, "Clearance Sale", "End of season clearance", 50.0)
_store.create(3, "Book Bundle Deal", "Buy 3 books at special price", 15.0)
# Add some redemptions
for _o in _store.offers[:3]:
    for _ in range(5):
        _o.redeem()


class CreateOfferRequest(BaseModel):
    store_id: int
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5, max_length=500)
    discount_percent: float = Field(gt=0, le=100)
    end_time: float | None = None
    max_redemptions: int | None = None


class UpdateOfferRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    discount_percent: float | None = None
    status: str | None = None
    end_time: float | None = None
    max_redemptions: int | None = None


# ── Public endpoints ────────────────────────────────────────────────

@router.get("/active")
async def list_active_offers(store_id: int | None = None) -> dict:
    offers = _store.active_offers(store_id)
    return {"offers": [o.to_dict() for o in offers]}


@router.get("/store/{store_id}")
async def store_offers(store_id: int) -> dict:
    offers = _store.by_store(store_id)
    return {
        "offers": [o.to_dict() for o in offers],
        "stats": _store.store_stats(store_id),
    }


@router.get("/{offer_id}")
async def get_offer(offer_id: int) -> dict:
    offer = _store.get(offer_id)
    if offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    return {"offer": offer.to_dict()}


@router.post("/{offer_id}/redeem")
async def redeem_offer(
    offer_id: int,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    offer = _store.get(offer_id)
    if offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    if not offer.redeem():
        raise HTTPException(status_code=400, detail="Offer is not available for redemption")
    return {"message": "Offer redeemed successfully", "offer": offer.to_dict()}


# ── Admin endpoints ─────────────────────────────────────────────────

@router.post("/admin/create")
async def admin_create_offer(
    body: CreateOfferRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    offer = _store.create(
        store_id=body.store_id,
        title=body.title,
        description=body.description,
        discount_percent=body.discount_percent,
        end_time=body.end_time,
        max_redemptions=body.max_redemptions,
    )
    return {"message": "Offer created", "offer": offer.to_dict()}


@router.put("/admin/{offer_id}")
async def admin_update_offer(
    offer_id: int,
    body: UpdateOfferRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    offer = _store.update(offer_id, **updates)
    if offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    return {"message": "Offer updated", "offer": offer.to_dict()}


@router.delete("/admin/{offer_id}")
async def admin_delete_offer(
    offer_id: int,
    current_user: User = Depends(require_admin),
) -> dict:
    if not _store.delete(offer_id):
        raise HTTPException(status_code=404, detail="Offer not found")
    return {"message": "Offer deleted"}


@router.get("/admin/recommendations")
async def admin_offer_recommendations(
    current_user: User = Depends(require_admin),
) -> dict:
    from app.ai import offer_recommender

    user_history = [
        {"store_id": 1, "category": "Electronics"},
        {"store_id": 2, "category": "Fashion"},
    ]
    available = [o.to_dict() for o in _store.active_offers()]
    recommendations = offer_recommender.recommend(user_history, available, top_n=5)
    return {"recommendations": recommendations}
