"""Complaints API routes."""

from __future__ import annotations

from time import time

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth.schemas.users import User
from app.auth.services.security import get_current_active_user, require_admin
from app.db.models.complaint import ComplaintDocument
from app.models.complaint import ComplaintCategory, ComplaintStatus

router = APIRouter(prefix="/complaints", tags=["complaints"])


def _complaint_dict(doc: ComplaintDocument) -> dict:
    return {
        "id": doc.complaint_id,
        "username": doc.username,
        "category": doc.category,
        "subject": doc.subject,
        "description": doc.description,
        "status": doc.status,
        "store_id": doc.store_id,
        "assigned_to": doc.assigned_to,
        "created_at": doc.created_at,
        "updated_at": doc.updated_at,
        "logs": doc.logs,
    }


class CreateComplaintRequest(BaseModel):
    category: ComplaintCategory
    subject: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=2000)
    store_id: int | None = None


class UpdateStatusRequest(BaseModel):
    status: ComplaintStatus


class AssignRequest(BaseModel):
    assignee: str = Field(min_length=1, max_length=100)


class AddLogRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)


# ── Customer endpoints ──────────────────────────────────────────────

@router.get("/my")
async def my_complaints(
    current_user: User = Depends(get_current_active_user),
) -> dict:
    complaints = await ComplaintDocument.find({"username": current_user.username}).to_list()
    return {
        "complaints": [_complaint_dict(c) for c in complaints],
        "total": len(complaints),
    }


@router.post("/")
async def create_complaint(
    body: CreateComplaintRequest,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    last = await ComplaintDocument.find().sort("-complaint_id").first_or_none()
    next_id = (last.complaint_id + 1) if last else 1

    now = time()
    doc = ComplaintDocument(
        complaint_id=next_id,
        username=current_user.username,
        category=body.category,
        subject=body.subject,
        description=body.description,
        store_id=body.store_id,
        created_at=now,
        updated_at=now,
    )
    await doc.insert()
    return {"message": "Complaint submitted", "complaint": _complaint_dict(doc)}


@router.get("/{complaint_id}")
async def get_complaint(
    complaint_id: int,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    complaint = await ComplaintDocument.find_one({"complaint_id": complaint_id})
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if complaint.username != current_user.username and current_user.role not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    return {"complaint": _complaint_dict(complaint)}


# ── Admin endpoints ─────────────────────────────────────────────────

@router.get("/admin/all")
async def admin_list_complaints(
    status: str | None = None,
    current_user: User = Depends(require_admin),
) -> dict:
    query = {"status": status} if status else {}
    complaints = await ComplaintDocument.find(query).to_list()
    all_complaints = await ComplaintDocument.find().to_list()
    summary = {
        "total": len(all_complaints),
        "open": len([c for c in all_complaints if c.status == "open"]),
        "in_progress": len([c for c in all_complaints if c.status == "in_progress"]),
        "resolved": len([c for c in all_complaints if c.status == "resolved"]),
        "escalated": len([c for c in all_complaints if c.status == "escalated"]),
        "closed": len([c for c in all_complaints if c.status == "closed"]),
    }
    return {
        "complaints": [_complaint_dict(c) for c in complaints],
        "total": len(complaints),
        "summary": summary,
    }


@router.put("/admin/{complaint_id}/status")
async def update_complaint_status(
    complaint_id: int,
    body: UpdateStatusRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    complaint = await ComplaintDocument.find_one({"complaint_id": complaint_id})
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    old_status = complaint.status
    complaint.status = body.status
    complaint.updated_at = time()
    complaint.logs.append({"message": f"Status changed from {old_status} to {body.status}", "author": current_user.username, "timestamp": time()})
    await complaint.save()
    return {"message": "Status updated", "complaint": _complaint_dict(complaint)}


@router.put("/admin/{complaint_id}/assign")
async def assign_complaint(
    complaint_id: int,
    body: AssignRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    complaint = await ComplaintDocument.find_one({"complaint_id": complaint_id})
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaint.assigned_to = body.assignee
    complaint.updated_at = time()
    complaint.logs.append({"message": f"Assigned to {body.assignee}", "author": current_user.username, "timestamp": time()})
    await complaint.save()
    return {"message": "Complaint assigned", "complaint": _complaint_dict(complaint)}


@router.post("/admin/{complaint_id}/escalate")
async def escalate_complaint(
    complaint_id: int,
    current_user: User = Depends(require_admin),
) -> dict:
    complaint = await ComplaintDocument.find_one({"complaint_id": complaint_id})
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    old_status = complaint.status
    complaint.status = "escalated"
    complaint.updated_at = time()
    complaint.logs.append({"message": f"Status changed from {old_status} to escalated", "author": current_user.username, "timestamp": time()})
    await complaint.save()
    return {"message": "Complaint escalated", "complaint": _complaint_dict(complaint)}


@router.post("/admin/{complaint_id}/log")
async def add_complaint_log(
    complaint_id: int,
    body: AddLogRequest,
    current_user: User = Depends(require_admin),
) -> dict:
    complaint = await ComplaintDocument.find_one({"complaint_id": complaint_id})
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaint.updated_at = time()
    complaint.logs.append({"message": body.message, "author": current_user.username, "timestamp": time()})
    await complaint.save()
    return {"message": "Log added", "complaint": _complaint_dict(complaint)}
