from typing import Dict

from passlib.context import CryptContext

from ..schemas.users import User, UserInDB


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# In-memory mock user store for initial development.
_fake_users_db: Dict[str, UserInDB] = {
	"admin@example.com": UserInDB(
		username="admin@example.com",
		full_name="Mall Administrator",
		email="admin@example.com",
		role="admin",
		hashed_password=pwd_context.hash("admin123"),
	),
	"superadmin@example.com": UserInDB(
		username="superadmin@example.com",
		full_name="Platform Super Admin",
		email="superadmin@example.com",
		role="super_admin",
		hashed_password=pwd_context.hash("super123"),
	),
}


def verify_password(plain_password: str, hashed_password: str) -> bool:
	return pwd_context.verify(plain_password, hashed_password)


def get_user(username: str) -> UserInDB | None:
	return _fake_users_db.get(username)


def authenticate_user(username: str, password: str) -> User | None:
	user = get_user(username)
	if not user:
		return None
	if not verify_password(password, user.hashed_password):
		return None
	return User(**user.model_dump())
