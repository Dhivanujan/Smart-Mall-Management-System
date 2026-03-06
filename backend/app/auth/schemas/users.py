from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
	username: str
	full_name: str | None = None
	email: str | None = None
	role: str


class User(UserBase):
	is_active: bool = True


class UserInDB(UserBase):
	is_active: bool = True
	hashed_password: str


class UserRegister(BaseModel):
	email: EmailStr
	full_name: str
	password: str
