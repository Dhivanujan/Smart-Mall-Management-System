"""Lost & found reports API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user
from app.db.models.lost_report import LostReportDocument

router = APIRouter(prefix="/lost-found", tags=["lost-found"])


def _report_dict(doc: LostReportDocument) -> dict:
    return {
        "id": doc.report_id,
        "username": doc.username,
        "item_description": doc.item_description,
        "last_seen_location": doc.last_seen_location,
        "contact_phone": doc.contact_phone,
        "additional_details": doc.additional_details,
        "status": doc.status,
        "created_at": doc.created_at,
    }


class CreateLostReportRequest(BaseModel):
    item_description: str = Field(min_length=3, max_length=400)
    last_seen_location: str = Field(min_length=2, max_length=200)
    contact_phone: str = Field(min_length=5, max_length=40)
    additional_details: str | None = Field(default=None, max_length=1000)


async def _next_report_id() -> int:
    last = await LostReportDocument.find().sort("-report_id").first_or_none()
    return (last.report_id + 1) if last else 1


@router.get("/reports/my")
async def list_my_reports(
    current_user: User = Depends(get_current_active_user),
) -> dict:
    reports = await LostReportDocument.find({"username": current_user.username}).to_list()
    reports.sort(key=lambda item: item.created_at, reverse=True)
    return {
        "reports": [_report_dict(item) for item in reports],
        "total": len(reports),
    }


@router.post("/reports")
async def create_report(
    body: CreateLostReportRequest,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    doc = LostReportDocument(
        report_id=await _next_report_id(),
        username=current_user.username,
        item_description=body.item_description,
        last_seen_location=body.last_seen_location,
        contact_phone=body.contact_phone,
        additional_details=body.additional_details,
    )
    await doc.insert()
    return {"message": "Lost report submitted", "report": _report_dict(doc)}
