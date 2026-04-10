"""Lost & found reports API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user, require_admin
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


class UpdateReportStatusRequest(BaseModel):
    status: str = Field(min_length=3, max_length=40)


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


@router.get("/admin/reports")
async def admin_list_reports(
    status: str | None = None,
    username: str | None = None,
    current_user: User = Depends(require_admin),
) -> dict:
    query: dict = {}
    if status:
        query["status"] = status
    if username:
        query["username"] = username

    reports = await LostReportDocument.find(query).to_list()
    reports.sort(key=lambda item: item.created_at, reverse=True)

    all_reports = await LostReportDocument.find().to_list()
    summary = {
        "total": len(all_reports),
        "open": len([r for r in all_reports if r.status == "open"]),
        "in_progress": len([r for r in all_reports if r.status == "in_progress"]),
        "matched": len([r for r in all_reports if r.status == "matched"]),
        "closed": len([r for r in all_reports if r.status == "closed"]),
    }

    return {
        "reports": [_report_dict(item) for item in reports],
        "total": len(reports),
        "summary": summary,
    }


@router.put("/admin/reports/{report_id}/status")
async def admin_update_report_status(
    report_id: int,
    body: UpdateReportStatusRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    allowed = {"open", "in_progress", "matched", "closed"}
    next_status = body.status.lower().strip()
    if next_status not in allowed:
        raise HTTPException(status_code=400, detail="Invalid report status")

    doc = await LostReportDocument.find_one({"report_id": report_id})
    if doc is None:
        raise HTTPException(status_code=404, detail="Report not found")

    doc.status = next_status
    await doc.save()
    return {"message": "Report status updated", "report": _report_dict(doc)}
