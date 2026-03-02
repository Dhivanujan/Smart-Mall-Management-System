from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from ....auth.schemas.tokens import Token
from ....auth.schemas.users import User
from ....auth.services.security import (
	ACCESS_TOKEN_EXPIRE_MINUTES,
	create_access_token,
	get_current_active_user,
)


router = APIRouter()


@router.post("/login", response_model=Token)
async def login_for_access_token(
	form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
	"""Issue a JWT access token for the given credentials.

	This is a mock implementation that validates against an in-memory
	user store. It is sufficient for wiring up admin/super-admin panels
	end-to-end and can later be replaced with real persistence.
	"""

	from ....auth.services.users import authenticate_user

	user = authenticate_user(form_data.username, form_data.password)
	if not user:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Incorrect username or password",
			headers={"WWW-Authenticate": "Bearer"},
		)

	access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
	access_token = create_access_token(
		data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
	)
	return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=User)
async def read_users_me(
	current_user: Annotated[User, Depends(get_current_active_user)],
) -> User:
	"""Return the currently authenticated user."""

	return current_user
