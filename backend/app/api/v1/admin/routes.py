from typing import Annotated

from fastapi import APIRouter, Depends

from ....auth.schemas.users import User
from ....auth.services.security import require_admin, require_super_admin
from ....db.models.store import StoreDocument
from ..queues.routes import (
	admin_advance_queue,
	admin_queue_summaries,
	admin_set_queue_paused,
)


router = APIRouter()


@router.get("/dashboard")
async def admin_dashboard(
	current_user: Annotated[User, Depends(require_admin)],
) -> dict:
	total_stores = await StoreDocument.find().count()
	return {
		"user": current_user,
		"metrics": {
			"total_stores": total_stores,
			"active_customers": 340,
			"daily_revenue": 15890.75,
			"open_tickets": 7,
		},
	}


@router.get("/stores")
async def admin_stores(
	current_user: Annotated[User, Depends(require_admin)],
) -> dict:
	docs = await StoreDocument.find().to_list()
	stores = [
		{"id": d.store_id, "name": d.name, "status": d.status, "category": d.category}
		for d in docs
	]
	return {"user": current_user, "stores": stores}


@router.get("/store-metrics")
async def admin_store_metrics(
	current_user: Annotated[User, Depends(require_admin)],
) -> dict:
	docs = await StoreDocument.find().to_list()
	metrics = [
		{
			"store_id": d.store_id,
			"name": d.name,
			"daily_revenue": 0.0,
			"footfall": d.current_footfall,
			"open_tickets": 0,
		}
		for d in docs
	]
	return {"user": current_user, "stores": metrics}


@router.get("/monitoring")
async def admin_monitoring_snapshot(
	current_user: Annotated[User, Depends(require_admin)],
) -> dict:
	"""Return a lightweight snapshot for near real-time monitoring."""

	snapshot = {
		"timestamp": "now",  # frontend treats as opaque string for the demo
		"footfall": {
			"mall_total": 540,
			"by_zone": {
				"North Wing": 180,
				"Central Plaza": 220,
				"South Wing": 140,
			},
		},
		"alerts": [
			{"id": "a1", "severity": "warning", "message": "South Wing near capacity (82%)."},
		],
	}
	return {"user": current_user, "snapshot": snapshot}


@router.get("/super/dashboard")
async def super_admin_dashboard(
	current_user: Annotated[User, Depends(require_super_admin)],
) -> dict:
	"""Return mock platform-wide metrics for super admins."""

	return {
		"user": current_user,
		"metrics": {
			"total_malls": 4,
			"total_stores": 120,
			"active_admins": 15,
			"system_uptime_days": 99,
		},
	}


@router.get("/super/admins")
async def super_admin_list_admins(
	current_user: Annotated[User, Depends(require_super_admin)],
) -> dict:
	"""Return a mock list of mall admins for the super admin panel."""

	admins = [
		{"username": "admin@example.com", "full_name": "Mall Administrator", "mall": "Downtown Mall"},
		{"username": "admin2@example.com", "full_name": "Uptown Admin", "mall": "Uptown Center"},
	]
	return {"user": current_user, "admins": admins}


@router.get("/super/tenants")
async def super_admin_tenants(
	current_user: Annotated[User, Depends(require_super_admin)],
) -> dict:
	"""Return mock tenant and billing information for super admins."""

	tenants = [
		{
			"mall_id": 1,
			"mall_name": "Downtown Mall",
			"monthly_recurring_revenue": 52000.0,
			"occupancy_percent": 92.0,
		},
		{
			"mall_id": 2,
			"mall_name": "Uptown Center",
			"monthly_recurring_revenue": 37000.0,
			"occupancy_percent": 85.5,
		},
		{
			"mall_id": 3,
			"mall_name": "Harbor Point",
			"monthly_recurring_revenue": 29500.0,
			"occupancy_percent": 79.0,
		},
	]
	return {"user": current_user, "tenants": tenants}


@router.get("/queues")
async def admin_queues(
	current_user: Annotated[User, Depends(require_admin)],
) -> dict:
	"""Return summaries for all store queues for admin monitoring."""

	return {"user": current_user, "queues": await admin_queue_summaries()}


@router.post("/queues/{store_id}/next")
async def admin_queue_next(
	store_id: int,
	current_user: Annotated[User, Depends(require_admin)],
) -> dict:
	"""Advance the given store queue to the next token."""

	state = await admin_advance_queue(store_id, skip_current=False)
	return {"user": current_user, "queue": state}


@router.post("/queues/{store_id}/skip")
async def admin_queue_skip(
	store_id: int,
	current_user: Annotated[User, Depends(require_admin)],
) -> dict:
	"""Skip the current token and move to the next waiting one."""

	state = await admin_advance_queue(store_id, skip_current=True)
	return {"user": current_user, "queue": state}


@router.post("/queues/{store_id}/pause")
async def admin_queue_pause(
	store_id: int,
	current_user: Annotated[User, Depends(require_admin)],
) -> dict:
	"""Pause the queue so new customers cannot join."""

	state = await admin_set_queue_paused(store_id, paused=True)
	return {"user": current_user, "queue": state}


@router.post("/queues/{store_id}/resume")
async def admin_queue_resume(
	store_id: int,
	current_user: Annotated[User, Depends(require_admin)],
) -> dict:
	"""Resume a previously paused queue."""

	state = await admin_set_queue_paused(store_id, paused=False)
	return {"user": current_user, "queue": state}
