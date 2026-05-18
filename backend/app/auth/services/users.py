import bcrypt

from ..schemas.users import User, UserInDB, UserRegister
from ..repositories.user_repository import user_repo
from ...db.models.user import UserDocument


def _hash_password(password: str) -> str:
	return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
	return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


def _doc_to_user_in_db(doc: UserDocument) -> UserInDB:
	return UserInDB(
		username=doc.username,
		full_name=doc.full_name,
		email=doc.email,
		role=doc.role,
		is_active=doc.is_active,
		hashed_password=doc.hashed_password,
	)


async def get_user(username: str) -> UserInDB | None:
	doc = await user_repo.get_by_username(username)
	if doc is None:
		return None
	return _doc_to_user_in_db(doc)


async def get_all_users(role: str | None = None) -> list[UserInDB]:
	kwargs = {"role": role} if role else {}
	docs = await user_repo.get_multi(**kwargs)
	return [_doc_to_user_in_db(d) for d in docs]


async def authenticate_user(username: str, password: str) -> User | None:
	user = await get_user(username)
	if not user:
		return None
	if not verify_password(password, user.hashed_password):
		return None
	return User(**user.model_dump())


async def register_user(data: UserRegister) -> User:
	"""Register a new customer user. Returns the created User."""
	existing = await user_repo.get_by_email(data.email)
	if existing:
		raise ValueError("Email already registered")
	
	doc = await user_repo.create({
		"username": data.email,
		"full_name": data.full_name,
		"email": data.email,
		"role": "customer",
		"hashed_password": _hash_password(data.password),
	})
	return User(**_doc_to_user_in_db(doc).model_dump())


async def create_user(username: str, full_name: str, email: str | None, role: str, password: str) -> UserInDB:
	doc = await user_repo.create({
		"username": username,
		"full_name": full_name,
		"email": email,
		"role": role,
		"hashed_password": _hash_password(password),
	})
	return _doc_to_user_in_db(doc)


async def update_user_fields(username: str, **fields: object) -> UserInDB | None:
	doc = await user_repo.get_by_username(username)
	if doc is None:
		return None
		
	doc = await user_repo.update(doc, fields)
	return _doc_to_user_in_db(doc)


async def set_user_password(username: str, new_password: str) -> bool:
	doc = await user_repo.get_by_username(username)
	if doc is None:
		return False
	await user_repo.update(doc, {"hashed_password": _hash_password(new_password)})
	return True


async def disable_user(username: str) -> bool:
	doc = await user_repo.get_by_username(username)
	if doc is None:
		return False
	await user_repo.update(doc, {"is_active": False})
	return True
