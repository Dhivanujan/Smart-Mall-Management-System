"""Notifications API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user
from app.db.models.notification import NotificationDocument

router = APIRouter(prefix="/notifications", tags=["notifications"])


def _notification_dict(doc: NotificationDocument) -> dict:
    return {
        "id": doc.notification_id,
        "username": doc.username,
        "notification_type": doc.notification_type,
        "title": doc.title,
        "message": doc.message,
        "is_read": doc.is_read,
        "created_at": doc.created_at,
    }


@router.get("/")
async def list_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    query: dict = {"username": current_user.username}
    if unread_only:
        query["is_read"] = False
    notifications = await NotificationDocument.find(query).to_list()
    unread = await NotificationDocument.find(
        {"username": current_user.username, "is_read": False}
    ).count()
    return {
        "notifications": [_notification_dict(n) for n in reversed(notifications)],
        "total": len(notifications),
        "unread_count": unread,
    }


@router.post("/{notification_id}/read")
async def mark_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    doc = await NotificationDocument.find_one(
        NotificationDocument.notification_id == notification_id
    )
    success = False
    if doc:
        doc.is_read = True
        await doc.save()
        success = True
    unread = await NotificationDocument.find(
        {"username": current_user.username, "is_read": False}
    ).count()
    return {"success": success, "unread_count": unread}


@router.post("/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_active_user),
) -> dict:
    docs = await NotificationDocument.find(
        {"username": current_user.username, "is_read": False}
    ).to_list()
    for doc in docs:
        doc.is_read = True
        await doc.save()
    unread = await NotificationDocument.find(
        {"username": current_user.username, "is_read": False}
    ).count()
    return {"marked_read": len(docs), "unread_count": unread}
