"""Offers API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user, require_admin
from app.db.models.offer import OfferDocument

router = APIRouter(prefix="/offers", tags=["offers"])


def _offer_dict(doc: OfferDocument) -> dict:
    return {
        "id": doc.offer_id,
        "store_id": doc.store_id,
        "title": doc.title,
        "description": doc.description,
        "discount_percent": doc.discount_percent,
        "status": doc.status,
        "start_time": doc.start_time,
        "end_time": doc.end_time,
        "redemption_count": doc.redemption_count,
        "max_redemptions": doc.max_redemptions,
        "created_at": doc.created_at,
    }


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


async def _next_offer_id() -> int:
    last = await OfferDocument.find().sort("-offer_id").first_or_none()
    return (last.offer_id + 1) if last else 1


# ── Public endpoints ────────────────────────────────────────────────

@router.get("/active")
async def list_active_offers(store_id: int | None = None) -> dict:
    query: dict = {"status": "active"}
    if store_id is not None:
        query["store_id"] = store_id
    offers = await OfferDocument.find(query).to_list()
    return {"offers": [_offer_dict(o) for o in offers]}


@router.get("/store/{store_id}")
async def store_offers(store_id: int) -> dict:
    offers = await OfferDocument.find({"store_id": store_id}).to_list()
    active = [o for o in offers if o.status == "active"]
    total_redeemed = sum(o.redemption_count for o in offers)
    return {
        "offers": [_offer_dict(o) for o in offers],
        "stats": {
            "total_offers": len(offers),
            "active_offers": len(active),
            "total_redemptions": total_redeemed,
        },
    }


@router.get("/{offer_id}")
async def get_offer(offer_id: int) -> dict:
    doc = await OfferDocument.find_one({"offer_id": offer_id})
    if doc is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    return {"offer": _offer_dict(doc)}


@router.post("/{offer_id}/redeem")
async def redeem_offer(
    offer_id: int,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    doc = await OfferDocument.find_one({"offer_id": offer_id})
    if doc is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    if doc.status != "active":
        raise HTTPException(status_code=400, detail="Offer is not available for redemption")
    if doc.max_redemptions is not None and doc.redemption_count >= doc.max_redemptions:
        raise HTTPException(status_code=400, detail="Offer is not available for redemption")
    doc.redemption_count += 1
    await doc.save()
    return {"message": "Offer redeemed successfully", "offer": _offer_dict(doc)}


# ── Admin endpoints ─────────────────────────────────────────────────

@router.post("/admin/create")
async def admin_create_offer(
    body: CreateOfferRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    doc = OfferDocument(
        offer_id=await _next_offer_id(),
        store_id=body.store_id,
        title=body.title,
        description=body.description,
        discount_percent=body.discount_percent,
        end_time=body.end_time,
        max_redemptions=body.max_redemptions,
    )
    await doc.insert()
    return {"message": "Offer created", "offer": _offer_dict(doc)}


@router.put("/admin/{offer_id}")
async def admin_update_offer(
    offer_id: int,
    body: UpdateOfferRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    doc = await OfferDocument.find_one({"offer_id": offer_id})
    if doc is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    for k, v in updates.items():
        setattr(doc, k, v)
    await doc.save()
    return {"message": "Offer updated", "offer": _offer_dict(doc)}


@router.delete("/admin/{offer_id}")
async def admin_delete_offer(
    offer_id: int,
    current_user: User = Depends(require_admin),
) -> dict:
    doc = await OfferDocument.find_one({"offer_id": offer_id})
    if doc is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    await doc.delete()
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
    active = await OfferDocument.find({"status": "active"}).to_list()
    available = [_offer_dict(o) for o in active]
    recommendations = offer_recommender.recommend(user_history, available, top_n=5)
    return {"recommendations": recommendations}
