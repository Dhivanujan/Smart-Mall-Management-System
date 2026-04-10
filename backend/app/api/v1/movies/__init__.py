"""Movie bookings API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user
from app.db.models.movie_booking import MovieBookingDocument

router = APIRouter(prefix="/movies", tags=["movies"])


def _booking_dict(doc: MovieBookingDocument) -> dict:
    return {
        "id": doc.booking_id,
        "movie_id": doc.movie_id,
        "movie_title": doc.movie_title,
        "showtime": doc.showtime,
        "booking_status": doc.booking_status,
        "created_at": doc.created_at,
    }


class CreateBookingRequest(BaseModel):
    movie_id: int
    movie_title: str = Field(min_length=2, max_length=200)
    showtime: str = Field(min_length=2, max_length=40)


async def _next_booking_id() -> int:
    last = await MovieBookingDocument.find().sort("-booking_id").first_or_none()
    return (last.booking_id + 1) if last else 1


@router.get("/bookings")
async def list_my_bookings(
    current_user: User = Depends(get_current_active_user),
) -> dict:
    bookings = await MovieBookingDocument.find({"username": current_user.username}).to_list()
    bookings.sort(key=lambda item: item.created_at, reverse=True)
    return {
        "bookings": [_booking_dict(item) for item in bookings],
        "total": len(bookings),
    }


@router.post("/bookings")
async def create_booking(
    body: CreateBookingRequest,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    existing = await MovieBookingDocument.find_one(
        {
            "username": current_user.username,
            "movie_id": body.movie_id,
            "showtime": body.showtime,
            "booking_status": "booked",
        }
    )
    if existing is not None:
        return {"message": "Booking already exists", "booking": _booking_dict(existing)}

    doc = MovieBookingDocument(
        booking_id=await _next_booking_id(),
        username=current_user.username,
        movie_id=body.movie_id,
        movie_title=body.movie_title,
        showtime=body.showtime,
    )
    await doc.insert()
    return {"message": "Booking created", "booking": _booking_dict(doc)}


@router.delete("/bookings/{booking_id}")
async def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    doc = await MovieBookingDocument.find_one(
        {"username": current_user.username, "booking_id": booking_id}
    )
    if doc is None:
        raise HTTPException(status_code=404, detail="Booking not found")

    doc.booking_status = "cancelled"
    await doc.save()
    return {"message": "Booking cancelled", "booking": _booking_dict(doc)}
