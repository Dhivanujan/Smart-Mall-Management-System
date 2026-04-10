"""Event reminders API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user
from app.db.models.event_reminder import EventReminderDocument

router = APIRouter(prefix="/events", tags=["events"])


def _reminder_dict(doc: EventReminderDocument) -> dict:
    return {
        "id": doc.reminder_id,
        "event_id": doc.event_id,
        "event_title": doc.event_title,
        "event_date": doc.event_date,
        "event_location": doc.event_location,
        "created_at": doc.created_at,
    }


class CreateReminderRequest(BaseModel):
    event_id: int
    event_title: str = Field(min_length=2, max_length=200)
    event_date: str = Field(min_length=2, max_length=100)
    event_location: str = Field(min_length=2, max_length=200)


async def _next_reminder_id() -> int:
    last = await EventReminderDocument.find().sort("-reminder_id").first_or_none()
    return (last.reminder_id + 1) if last else 1


@router.get("/reminders")
async def list_my_reminders(
    current_user: User = Depends(get_current_active_user),
) -> dict:
    reminders = await EventReminderDocument.find({"username": current_user.username}).to_list()
    reminders.sort(key=lambda item: item.created_at, reverse=True)
    return {
        "reminders": [_reminder_dict(item) for item in reminders],
        "total": len(reminders),
    }


@router.post("/reminders")
async def create_reminder(
    body: CreateReminderRequest,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    existing = await EventReminderDocument.find_one(
        {"username": current_user.username, "event_id": body.event_id}
    )
    if existing is not None:
        return {"message": "Reminder already exists", "reminder": _reminder_dict(existing)}

    doc = EventReminderDocument(
        reminder_id=await _next_reminder_id(),
        username=current_user.username,
        event_id=body.event_id,
        event_title=body.event_title,
        event_date=body.event_date,
        event_location=body.event_location,
    )
    await doc.insert()
    return {"message": "Reminder created", "reminder": _reminder_dict(doc)}


@router.delete("/reminders/{event_id}")
async def delete_reminder(
    event_id: int,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    doc = await EventReminderDocument.find_one(
        {"username": current_user.username, "event_id": event_id}
    )
    if doc is None:
        raise HTTPException(status_code=404, detail="Reminder not found")

    await doc.delete()
    return {"message": "Reminder removed"}
