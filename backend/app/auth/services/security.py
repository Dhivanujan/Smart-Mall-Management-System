from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from ..schemas.tokens import TokenData
from ..schemas.users import User
from .users import get_user


SECRET_KEY = "CHANGE_ME_IN_PRODUCTION"  # noqa: S105
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
	to_encode = data.copy()
	if expires_delta is None:
		expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
	expire = datetime.now(timezone.utc) + expires_delta
	to_encode.update({"exp": expire})
	encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
	return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
	credentials_exception = HTTPException(
		status_code=status.HTTP_401_UNAUTHORIZED,
		detail="Could not validate credentials",
		headers={"WWW-Authenticate": "Bearer"},
	)
	try:
		payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
		username: str | None = payload.get("sub")
		role: str | None = payload.get("role")
		if username is None:
			raise credentials_exception
		token_data = TokenData(username=username, role=role)
	except JWTError as exc:  # pragma: no cover - defensive
		raise credentials_exception from exc

	user_in_db = get_user(token_data.username)
	if user_in_db is None:
		raise credentials_exception
	return User(**user_in_db.model_dump())


async def get_current_active_user(
	current_user: Annotated[User, Depends(get_current_user)],
) -> User:
	if not current_user.is_active:
		raise HTTPException(status_code=400, detail="Inactive user")
	return current_user


async def require_admin(current_user: Annotated[User, Depends(get_current_active_user)]) -> User:
	if current_user.role not in {"admin", "super_admin"}:
		raise HTTPException(status_code=403, detail="Admin access required")
	return current_user


async def require_super_admin(
	current_user: Annotated[User, Depends(get_current_active_user)],
) -> User:
	if current_user.role != "super_admin":
		raise HTTPException(status_code=403, detail="Super admin access required")
	return current_user
