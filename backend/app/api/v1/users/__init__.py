"""User & role management API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user, require_super_admin
from app.auth.services.users import (
    _hash_password,
    create_user,
    disable_user,
    get_all_users,
    get_user,
    set_user_password,
    update_user_fields,
)

router = APIRouter(prefix="/users", tags=["users"])


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=6, max_length=128)
    full_name: str = Field(min_length=1, max_length=200)
    email: str | None = None
    role: str = "customer"


class CreateUserRequest(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=6, max_length=128)
    full_name: str = Field(min_length=1, max_length=200)
    email: str | None = None
    role: str = Field(default="customer", pattern=r"^(customer|admin|super_admin)$")


class UpdateUserRequest(BaseModel):
    full_name: str | None = None
    email: str | None = None
    is_active: bool | None = None
    role: str | None = None


class ResetPasswordRequest(BaseModel):
    new_password: str = Field(min_length=6, max_length=128)


# ── Public endpoints ────────────────────────────────────────────────

@router.post("/register")
async def register_user_endpoint(body: RegisterRequest) -> dict:
    existing = await get_user(body.username)
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")
    if body.role not in ("customer",):
        raise HTTPException(status_code=400, detail="Can only register as customer")
    user = await create_user(body.username, body.full_name, body.email, "customer", body.password)
    return {
        "message": "Registration successful",
        "user": {
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
        },
    }


@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_active_user),
) -> dict:
    return {
        "user": {
            "username": current_user.username,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role,
        }
    }


@router.put("/profile")
async def update_profile(
    body: UpdateUserRequest,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    updated = await update_user_fields(
        current_user.username,
        full_name=body.full_name,
        email=body.email,
    )
    if updated is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "message": "Profile updated",
        "user": {
            "username": updated.username,
            "full_name": updated.full_name,
            "email": updated.email,
            "role": updated.role,
        },
    }


# ── Super Admin endpoints ──────────────────────────────────────────

@router.get("/admin/list")
async def admin_list_users(
    role: str | None = None,
    current_user: User = Depends(require_super_admin),
) -> dict:
    users = await get_all_users(role)
    return {
        "users": [
            {
                "username": u.username,
                "full_name": u.full_name,
                "email": u.email,
                "role": u.role,
                "is_active": u.is_active,
            }
            for u in users
        ],
        "total": len(users),
    }


@router.post("/admin/create")
async def admin_create_user(
    body: CreateUserRequest,
    current_user: User = Depends(require_super_admin),
) -> dict:
    existing = await get_user(body.username)
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")
    user = await create_user(body.username, body.full_name, body.email, body.role, body.password)
    return {
        "message": "User created",
        "user": {
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
        },
    }


@router.put("/admin/{username}")
async def admin_update_user(
    username: str,
    body: UpdateUserRequest,
    current_user: User = Depends(require_super_admin),
) -> dict:
    updated = await update_user_fields(
        username,
        full_name=body.full_name,
        email=body.email,
        is_active=body.is_active,
        role=body.role,
    )
    if updated is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "message": "User updated",
        "user": {
            "username": updated.username,
            "full_name": updated.full_name,
            "email": updated.email,
            "role": updated.role,
            "is_active": updated.is_active,
        },
    }


@router.post("/admin/{username}/reset-password")
async def admin_reset_password(
    username: str,
    body: ResetPasswordRequest,
    current_user: User = Depends(require_super_admin),
) -> dict:
    success = await set_user_password(username, body.new_password)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"Password reset for {username}"}


@router.delete("/admin/{username}")
async def admin_delete_user(
    username: str,
    current_user: User = Depends(require_super_admin),
) -> dict:
    if username == current_user.username:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    success = await disable_user(username)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {username} disabled"}
