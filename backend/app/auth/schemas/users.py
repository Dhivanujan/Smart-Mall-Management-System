from enum import Enum

from pydantic import BaseModel, EmailStr


class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    MALL_MANAGER = "mall_manager"
    STORE_ADMIN = "admin"  # mapping existing 'admin' to STORE_ADMIN for backwards compatibility
    FINANCE_MANAGER = "finance_manager"
    SECURITY_STAFF = "security_staff"
    MAINTENANCE_STAFF = "maintenance_staff"
    PARKING_MANAGER = "parking_manager"
    MARKETING_TEAM = "marketing_team"
    CUSTOMER = "customer"
    DELIVERY_PARTNER = "delivery_partner"



class UserBase(BaseModel):
	username: str
	full_name: str | None = None
	email: str | None = None
	role: UserRole | str


class User(UserBase):
	is_active: bool = True


class UserInDB(UserBase):
	is_active: bool = True
	hashed_password: str


class UserRegister(BaseModel):
	email: EmailStr
	full_name: str
	password: str


class UpdateUserRequest(BaseModel):
	full_name: str | None = None
	email: str | None = None
	is_active: bool | None = None
	role: str | None = None

