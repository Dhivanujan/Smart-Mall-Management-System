from typing import Dict

import bcrypt

from ..schemas.users import User, UserInDB


def _hash_password(password: str) -> str:
	return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


# In-memory mock user store for initial development.
_fake_users_db: Dict[str, UserInDB] = {
	"admin@example.com": UserInDB(
		username="admin@example.com",
		full_name="Mall Administrator",
		email="admin@example.com",
		role="admin",
		hashed_password=_hash_password("admin123"),
	),
	"superadmin@example.com": UserInDB(
		username="superadmin@example.com",
		full_name="Platform Super Admin",
		email="superadmin@example.com",
		role="super_admin",
		hashed_password=_hash_password("super123"),
	),
}


def verify_password(plain_password: str, hashed_password: str) -> bool:
	return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


def get_user(username: str) -> UserInDB | None:
	return _fake_users_db.get(username)


def authenticate_user(username: str, password: str) -> User | None:
	user = get_user(username)
	if not user:
		return None
	if not verify_password(password, user.hashed_password):
		return None
	return User(**user.model_dump())
