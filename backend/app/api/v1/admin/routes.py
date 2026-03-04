from typing import Annotated

from fastapi import APIRouter, Depends

from ....auth.schemas.users import User
from ....auth.services.security import require_admin, require_super_admin


router = APIRouter()


_ADMIN_STORES = [
	{"id": 1, "name": "ElectroHub", "status": "open", "category": "Electronics"},
	{"id": 2, "name": "Fashion Lane", "status": "open", "category": "Fashion"},
	{"id": 3, "name": "Book Nook", "status": "closed", "category": "Books"},
]


@router.get("/dashboard")
async def admin_dashboard(
	current_user: Annotated[User, Depends(require_admin)],
) -> dict:
	"""Return mock dashboard metrics for admin users.

	This is intentionally simple and uses static data so that the
	frontend admin panel can be developed end-to-end.
	"""

	return {
		"user": current_user,
		"metrics": {
			"total_stores": len(_ADMIN_STORES),
			"active_customers": 340,
			"daily_revenue": 15890.75,
			"open_tickets": 7,
		},
	}


@router.get("/stores")
async def admin_stores(
	current_user: Annotated[User, Depends(require_admin)],
) -> dict:
	"""Return a mock list of stores managed by the admin."""

	return {"user": current_user, "stores": _ADMIN_STORES}


@router.get("/store-metrics")
async def admin_store_metrics(
	current_user: Annotated[User, Depends(require_admin)],
) -> dict:
	"""Return mock per-store metrics for admin analytics views."""

	metrics = [
		{
			"store_id": 1,
			"name": "ElectroHub",
			"daily_revenue": 9800.0,
			"footfall": 320,
			"open_tickets": 3,
		},
		{
			"store_id": 2,
			"name": "Fashion Lane",
			"daily_revenue": 4300.5,
			"footfall": 210,
			"open_tickets": 2,
		},
		{
			"store_id": 3,
			"name": "Book Nook",
			"daily_revenue": 790.25,
			"footfall": 65,
			"open_tickets": 1,
		},
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
