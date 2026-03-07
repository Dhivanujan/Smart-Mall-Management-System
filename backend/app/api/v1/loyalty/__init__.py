"""Loyalty & rewards API routes."""

from __future__ import annotations

from time import time

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user
from app.db.models.loyalty import LoyaltyAccountDocument

router = APIRouter(prefix="/loyalty", tags=["loyalty"])

_TIER_THRESHOLDS = [(5000, "Platinum"), (2000, "Gold"), (500, "Silver")]


def _compute_tier(lifetime_earned: int) -> str:
    for threshold, tier in _TIER_THRESHOLDS:
        if lifetime_earned >= threshold:
            return tier
    return "Bronze"


async def _get_or_create_account(username: str) -> LoyaltyAccountDocument:
    doc = await LoyaltyAccountDocument.find_one(
        LoyaltyAccountDocument.username == username
    )
    if doc is None:
        doc = LoyaltyAccountDocument(username=username)
        await doc.insert()
    return doc


def _account_summary(doc: LoyaltyAccountDocument) -> dict:
    return {
        "username": doc.username,
        "total_points": doc.total_points,
        "lifetime_earned": doc.lifetime_earned,
        "lifetime_redeemed": doc.lifetime_redeemed,
        "tier": doc.tier,
    }


class EarnRequest(BaseModel):
    points: int = Field(gt=0, le=10000)
    description: str = Field(min_length=1, max_length=200)
    store_id: int | None = None


class RedeemRequest(BaseModel):
    points: int = Field(gt=0, le=100000)
    description: str = Field(min_length=1, max_length=200)


@router.get("/account")
async def get_account(
    current_user: User = Depends(get_current_active_user),
) -> dict:
    account = await _get_or_create_account(current_user.username)
    return {"account": _account_summary(account)}


@router.get("/history")
async def get_history(
    current_user: User = Depends(get_current_active_user),
    limit: int = 20,
) -> dict:
    account = await _get_or_create_account(current_user.username)
    transactions = account.transactions[-limit:]
    return {
        "transactions": list(reversed(transactions)),
        "total_transactions": len(account.transactions),
    }


@router.post("/earn")
async def earn_points(
    body: EarnRequest,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    account = await _get_or_create_account(current_user.username)
    tx = {
        "tx_id": account.next_tx_id,
        "transaction_type": "earn",
        "points": body.points,
        "description": body.description,
        "store_id": body.store_id,
        "timestamp": time(),
    }
    account.transactions.append(tx)
    account.next_tx_id += 1
    account.total_points += body.points
    account.lifetime_earned += body.points
    account.tier = _compute_tier(account.lifetime_earned)
    await account.save()
    return {
        "message": f"Earned {body.points} points",
        "transaction": tx,
        "new_balance": account.total_points,
        "tier": account.tier,
    }


@router.post("/redeem")
async def redeem_points(
    body: RedeemRequest,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    account = await _get_or_create_account(current_user.username)
    if body.points > account.total_points:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient points. Available: {account.total_points}",
        )
    tx = {
        "tx_id": account.next_tx_id,
        "transaction_type": "redeem",
        "points": body.points,
        "description": body.description,
        "store_id": None,
        "timestamp": time(),
    }
    account.transactions.append(tx)
    account.next_tx_id += 1
    account.total_points -= body.points
    account.lifetime_redeemed += body.points
    account.tier = _compute_tier(account.lifetime_earned)
    await account.save()
    return {
        "message": f"Redeemed {body.points} points",
        "transaction": tx,
        "new_balance": account.total_points,
        "tier": account.tier,
    }
