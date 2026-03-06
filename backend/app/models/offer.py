"""Offer and promotion models."""

from __future__ import annotations

from dataclasses import dataclass, field
from time import time
from typing import Literal

OfferStatus = Literal["active", "inactive", "expired", "scheduled"]


@dataclass
class Offer:
    id: int
    store_id: int
    title: str
    description: str
    discount_percent: float
    status: OfferStatus = "active"
    start_time: float = field(default_factory=time)
    end_time: float | None = None
    redemption_count: int = 0
    max_redemptions: int | None = None
    created_at: float = field(default_factory=time)

    def is_active(self) -> bool:
        now = time()
        if self.status != "active":
            return False
        if self.end_time and now > self.end_time:
            return False
        if self.max_redemptions and self.redemption_count >= self.max_redemptions:
            return False
        return True

    def redeem(self) -> bool:
        if not self.is_active():
            return False
        self.redemption_count += 1
        return True

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "store_id": self.store_id,
            "title": self.title,
            "description": self.description,
            "discount_percent": self.discount_percent,
            "status": self.status,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "redemption_count": self.redemption_count,
            "max_redemptions": self.max_redemptions,
            "is_active": self.is_active(),
            "created_at": self.created_at,
        }


@dataclass
class OfferStore:
    offers: list[Offer] = field(default_factory=list)
    _next_id: int = field(default=1, repr=False)

    def create(
        self,
        store_id: int,
        title: str,
        description: str,
        discount_percent: float,
        end_time: float | None = None,
        max_redemptions: int | None = None,
    ) -> Offer:
        offer = Offer(
            id=self._next_id,
            store_id=store_id,
            title=title,
            description=description,
            discount_percent=discount_percent,
            end_time=end_time,
            max_redemptions=max_redemptions,
        )
        self._next_id += 1
        self.offers.append(offer)
        return offer

    def get(self, offer_id: int) -> Offer | None:
        for o in self.offers:
            if o.id == offer_id:
                return o
        return None

    def by_store(self, store_id: int) -> list[Offer]:
        return [o for o in self.offers if o.store_id == store_id]

    def active_offers(self, store_id: int | None = None) -> list[Offer]:
        result = [o for o in self.offers if o.is_active()]
        if store_id is not None:
            result = [o for o in result if o.store_id == store_id]
        return result

    def update(self, offer_id: int, **kwargs: object) -> Offer | None:
        offer = self.get(offer_id)
        if offer is None:
            return None
        for key, val in kwargs.items():
            if hasattr(offer, key):
                setattr(offer, key, val)
        return offer

    def delete(self, offer_id: int) -> bool:
        for i, o in enumerate(self.offers):
            if o.id == offer_id:
                self.offers.pop(i)
                return True
        return False

    def store_stats(self, store_id: int) -> dict:
        store_offers = self.by_store(store_id)
        active = [o for o in store_offers if o.is_active()]
        total_redemptions = sum(o.redemption_count for o in store_offers)
        return {
            "total_offers": len(store_offers),
            "active_offers": len(active),
            "total_redemptions": total_redemptions,
        }
