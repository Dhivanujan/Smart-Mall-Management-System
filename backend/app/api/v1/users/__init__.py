"""User & role management API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth.schemas.users import User, UserInDB
from app.auth.services.security import get_current_active_user, require_super_admin
from app.auth.services.users import (
    _fake_users_db,
    _hash_password,
    get_user,
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
async def register_user(body: RegisterRequest) -> dict:
    if body.username in _fake_users_db:
        raise HTTPException(status_code=409, detail="Username already exists")
    if body.role not in ("customer",):
        raise HTTPException(status_code=400, detail="Can only register as customer")
    user = UserInDB(
        username=body.username,
        full_name=body.full_name,
        email=body.email,
        role="customer",
        hashed_password=_hash_password(body.password),
    )
    _fake_users_db[body.username] = user
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
    db_user = get_user(current_user.username)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if body.full_name is not None:
        db_user.full_name = body.full_name
    if body.email is not None:
        db_user.email = body.email
    _fake_users_db[db_user.username] = db_user
    return {
        "message": "Profile updated",
        "user": {
            "username": db_user.username,
            "full_name": db_user.full_name,
            "email": db_user.email,
            "role": db_user.role,
        },
    }


# ── Super Admin endpoints ──────────────────────────────────────────

@router.get("/admin/list")
async def admin_list_users(
    role: str | None = None,
    current_user: User = Depends(require_super_admin),
) -> dict:
    users = list(_fake_users_db.values())
    if role:
        users = [u for u in users if u.role == role]
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
    if body.username in _fake_users_db:
        raise HTTPException(status_code=409, detail="Username already exists")
    user = UserInDB(
        username=body.username,
        full_name=body.full_name,
        email=body.email,
        role=body.role,
        hashed_password=_hash_password(body.password),
    )
    _fake_users_db[body.username] = user
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
    db_user = get_user(username)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if body.full_name is not None:
        db_user.full_name = body.full_name
    if body.email is not None:
        db_user.email = body.email
    if body.is_active is not None:
        db_user.is_active = body.is_active
    if body.role is not None:
        db_user.role = body.role
    _fake_users_db[username] = db_user
    return {
        "message": "User updated",
        "user": {
            "username": db_user.username,
            "full_name": db_user.full_name,
            "email": db_user.email,
            "role": db_user.role,
            "is_active": db_user.is_active,
        },
    }


@router.post("/admin/{username}/reset-password")
async def admin_reset_password(
    username: str,
    body: ResetPasswordRequest,
    current_user: User = Depends(require_super_admin),
) -> dict:
    db_user = get_user(username)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.hashed_password = _hash_password(body.new_password)
    _fake_users_db[username] = db_user
    return {"message": f"Password reset for {username}"}


@router.delete("/admin/{username}")
async def admin_delete_user(
    username: str,
    current_user: User = Depends(require_super_admin),
) -> dict:
    if username == current_user.username:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    if username not in _fake_users_db:
        raise HTTPException(status_code=404, detail="User not found")
    db_user = _fake_users_db[username]
    db_user.is_active = False
    _fake_users_db[username] = db_user
    return {"message": f"User {username} disabled"}
