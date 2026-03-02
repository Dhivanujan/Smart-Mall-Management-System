from pydantic import BaseModel


class UserBase(BaseModel):
	username: str
	full_name: str | None = None
	email: str | None = None
	role: str


class User(UserBase):
	is_active: bool = True


class UserInDB(UserBase):
	hashed_password: str
