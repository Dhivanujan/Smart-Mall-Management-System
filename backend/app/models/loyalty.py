"""Loyalty & rewards domain models."""

from __future__ import annotations

from dataclasses import dataclass, field
from time import time
from typing import Literal

TransactionType = Literal["earn", "redeem"]


@dataclass
class LoyaltyTransaction:
    id: int
    username: str
    transaction_type: TransactionType
    points: int
    description: str
    timestamp: float = field(default_factory=time)
    store_id: int | None = None

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "transaction_type": self.transaction_type,
            "points": self.points,
            "description": self.description,
            "timestamp": self.timestamp,
            "store_id": self.store_id,
        }


@dataclass
class LoyaltyAccount:
    username: str
    total_points: int = 0
    lifetime_earned: int = 0
    lifetime_redeemed: int = 0
    tier: str = "Bronze"
    transactions: list[LoyaltyTransaction] = field(default_factory=list)

    _next_tx_id: int = field(default=1, repr=False)

    def earn(self, points: int, description: str, store_id: int | None = None) -> LoyaltyTransaction:
        tx = LoyaltyTransaction(
            id=self._next_tx_id,
            username=self.username,
            transaction_type="earn",
            points=points,
            description=description,
            store_id=store_id,
        )
        self._next_tx_id += 1
        self.total_points += points
        self.lifetime_earned += points
        self.transactions.append(tx)
        self._update_tier()
        return tx

    def redeem(self, points: int, description: str) -> LoyaltyTransaction | None:
        if points > self.total_points:
            return None
        tx = LoyaltyTransaction(
            id=self._next_tx_id,
            username=self.username,
            transaction_type="redeem",
            points=points,
            description=description,
        )
        self._next_tx_id += 1
        self.total_points -= points
        self.lifetime_redeemed += points
        self.transactions.append(tx)
        self._update_tier()
        return tx

    def _update_tier(self) -> None:
        if self.lifetime_earned >= 10000:
            self.tier = "Platinum"
        elif self.lifetime_earned >= 5000:
            self.tier = "Gold"
        elif self.lifetime_earned >= 1000:
            self.tier = "Silver"
        else:
            self.tier = "Bronze"

    def summary(self) -> dict:
        return {
            "username": self.username,
            "total_points": self.total_points,
            "lifetime_earned": self.lifetime_earned,
            "lifetime_redeemed": self.lifetime_redeemed,
            "tier": self.tier,
            "recent_transactions": [
                tx.to_dict() for tx in self.transactions[-10:]
            ],
        }
