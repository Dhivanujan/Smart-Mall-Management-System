"""Discovery and AI concierge routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user
from app.db.models.offer import OfferDocument
from app.db.models.store import StoreDocument

router = APIRouter(prefix="/discovery", tags=["discovery"])


class ConciergeRequest(BaseModel):
    query: str = Field(min_length=2, max_length=400)


@router.get("/trending-stores")
async def trending_stores(limit: int = 5) -> dict:
    stores = await StoreDocument.find({"status": "open"}).to_list()
    stores.sort(key=lambda s: (s.current_footfall, s.average_rating), reverse=True)
    top = stores[: max(1, min(limit, 12))]
    return {
        "stores": [
            {
                "id": s.store_id,
                "name": s.name,
                "category": s.category,
                "current_footfall": s.current_footfall,
                "average_rating": s.average_rating,
            }
            for s in top
        ]
    }


@router.post("/concierge")
async def concierge(
    body: ConciergeRequest,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    query = body.query.lower().strip()

    stores = await StoreDocument.find({"status": "open"}).to_list()
    offers = await OfferDocument.find({"status": "active"}).to_list()

    matched_stores = [
        s for s in stores if query in s.name.lower() or query in s.category.lower() or query in s.description.lower()
    ]
    matched_offers = [
        o for o in offers if query in o.title.lower() or query in o.description.lower()
    ]

    if not matched_stores and not matched_offers:
        matched_stores = sorted(stores, key=lambda s: (s.average_rating, s.current_footfall), reverse=True)[:4]

    tips = []
    if "kids" in query or "family" in query:
        tips.append("Best times for family visits are weekday afternoons when queues are shorter.")
    if "food" in query or "dining" in query:
        tips.append("Check active offers before dining for instant discount redemptions.")
    if "parking" in query:
        tips.append("Use Smart Parking in-app for real-time spot availability before arrival.")
    if not tips:
        tips.append("Try searching by category (fashion, electronics, dining) for better matches.")

    return {
        "message": f"Here are personalized suggestions for {current_user.full_name or current_user.username}.",
        "stores": [
            {
                "id": s.store_id,
                "name": s.name,
                "category": s.category,
                "average_rating": s.average_rating,
                "current_footfall": s.current_footfall,
            }
            for s in matched_stores[:6]
        ],
        "offers": [
            {
                "id": o.offer_id,
                "title": o.title,
                "store_id": o.store_id,
                "discount_percent": o.discount_percent,
            }
            for o in matched_offers[:6]
        ],
        "tips": tips,
    }
