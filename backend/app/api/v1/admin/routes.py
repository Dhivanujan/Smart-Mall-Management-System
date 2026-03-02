from typing import Annotated

from fastapi import APIRouter, Depends

from ....auth.schemas.users import User
from ....auth.services.security import require_admin, require_super_admin


router = APIRouter()


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
			"total_stores": 12,
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

	stores = [
		{"id": 1, "name": "ElectroHub", "status": "open"},
		{"id": 2, "name": "Fashion Lane", "status": "open"},
		{"id": 3, "name": "Book Nook", "status": "closed"},
	]
	return {"user": current_user, "stores": stores}


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
