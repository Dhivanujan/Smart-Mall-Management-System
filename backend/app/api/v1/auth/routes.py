from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt

from ....auth.schemas.tokens import RefreshRequest, Token
from ....auth.schemas.users import User, UserRegister
from ....auth.services.security import (
	create_access_token,
	get_current_active_user,
)
from ....core.config import get_settings


router = APIRouter()


def _create_refresh_token(data: dict) -> str:
	settings = get_settings()
	return create_access_token(
		data={**data, "type": "refresh"},
		expires_delta=timedelta(days=7),
	)


@router.post("/login", response_model=Token)
async def login_for_access_token(
	form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
	"""Issue JWT access and refresh tokens for the given credentials."""

	from ....auth.services.users import authenticate_user

	user = await authenticate_user(form_data.username, form_data.password)
	if not user:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Incorrect username or password",
			headers={"WWW-Authenticate": "Bearer"},
		)

	settings = get_settings()
	access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
	token_data = {"sub": user.username, "role": user.role}
	access_token = create_access_token(data=token_data, expires_delta=access_token_expires)
	refresh_token = _create_refresh_token(token_data)
	return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer")


@router.post("/refresh", response_model=Token)
async def refresh_access_token(body: RefreshRequest) -> Token:
	"""Issue a new access token using a valid refresh token."""

	settings = get_settings()
	try:
		payload = jwt.decode(
			body.refresh_token, settings.secret_key, algorithms=[settings.jwt_algorithm]
		)
		if payload.get("type") != "refresh":
			raise HTTPException(status_code=401, detail="Invalid token type")
		username: str | None = payload.get("sub")
		role: str | None = payload.get("role")
		if username is None:
			raise HTTPException(status_code=401, detail="Invalid refresh token")
	except JWTError:
		raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

	token_data = {"sub": username, "role": role}
	access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
	access_token = create_access_token(data=token_data, expires_delta=access_token_expires)
	refresh_token = _create_refresh_token(token_data)
	return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer")


@router.get("/me", response_model=User)
async def read_users_me(
	current_user: Annotated[User, Depends(get_current_active_user)],
) -> User:
	"""Return the currently authenticated user."""

	return current_user


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_customer(body: UserRegister) -> User:
	"""Register a new customer account."""
	from ....auth.services.users import register_user

	try:
		return await register_user(body)
	except ValueError as exc:
		raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
