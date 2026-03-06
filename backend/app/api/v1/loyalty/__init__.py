"""Loyalty & rewards API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user
from app.models.loyalty import LoyaltyAccount

router = APIRouter(prefix="/loyalty", tags=["loyalty"])

_accounts: dict[str, LoyaltyAccount] = {}


def _get_or_create_account(username: str) -> LoyaltyAccount:
    if username not in _accounts:
        account = LoyaltyAccount(username=username)
        # Seed some demo transactions
        account.earn(500, "Welcome bonus")
        account.earn(150, "Purchase at ElectroHub", store_id=1)
        account.earn(80, "Purchase at Fashion Lane", store_id=2)
        _accounts[username] = account
    return _accounts[username]


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
    account = _get_or_create_account(current_user.username)
    return {"account": account.summary()}


@router.get("/history")
async def get_history(
    current_user: User = Depends(get_current_active_user),
    limit: int = 20,
) -> dict:
    account = _get_or_create_account(current_user.username)
    transactions = account.transactions[-limit:]
    return {
        "transactions": [tx.to_dict() for tx in reversed(transactions)],
        "total_transactions": len(account.transactions),
    }


@router.post("/earn")
async def earn_points(
    body: EarnRequest,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    account = _get_or_create_account(current_user.username)
    tx = account.earn(body.points, body.description, body.store_id)
    return {
        "message": f"Earned {body.points} points",
        "transaction": tx.to_dict(),
        "new_balance": account.total_points,
        "tier": account.tier,
    }


@router.post("/redeem")
async def redeem_points(
    body: RedeemRequest,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    account = _get_or_create_account(current_user.username)
    tx = account.redeem(body.points, body.description)
    if tx is None:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient points. Available: {account.total_points}",
        )
    return {
        "message": f"Redeemed {body.points} points",
        "transaction": tx.to_dict(),
        "new_balance": account.total_points,
        "tier": account.tier,
    }
