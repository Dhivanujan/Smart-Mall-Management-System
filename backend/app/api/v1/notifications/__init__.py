"""Notifications API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user
from app.models.notification import NotificationStore

router = APIRouter(prefix="/notifications", tags=["notifications"])

_store = NotificationStore()

# Seed demo notifications
_store.create("admin@example.com", "queue_status", "Queue Update", "Token #5 is now being served at ElectroHub")
_store.create("admin@example.com", "offer", "New Offer!", "20% off on all Electronics this weekend")
_store.create("admin@example.com", "parking_expiry", "Parking Reminder", "Your parking reservation expires in 30 minutes")
_store.create("admin@example.com", "system", "Welcome!", "Welcome to Smart Mall Management System")
_store.create("superadmin@example.com", "complaint_response", "Complaint Updated", "Complaint #1 has been resolved")
_store.create("superadmin@example.com", "system", "System Alert", "System maintenance scheduled for tonight")


@router.get("/")
async def list_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    notifications = _store.for_user(current_user.username, unread_only=unread_only)
    return {
        "notifications": [n.to_dict() for n in reversed(notifications)],
        "total": len(notifications),
        "unread_count": _store.unread_count(current_user.username),
    }


@router.post("/{notification_id}/read")
async def mark_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    success = _store.mark_read(notification_id)
    return {
        "success": success,
        "unread_count": _store.unread_count(current_user.username),
    }


@router.post("/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_active_user),
) -> dict:
    count = _store.mark_all_read(current_user.username)
    return {
        "marked_read": count,
        "unread_count": _store.unread_count(current_user.username),
    }
