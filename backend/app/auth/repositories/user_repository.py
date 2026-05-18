from typing import Any
from app.core.repository import BaseRepository
from app.db.models.user import UserDocument
from app.auth.schemas.users import UserRegister, UpdateUserRequest

class UserRepository(BaseRepository[UserDocument, UserRegister, UpdateUserRequest]):
    async def get_by_username(self, username: str) -> UserDocument | None:
        return await self.model.find_one({"username": username})
        
    async def get_by_email(self, email: str) -> UserDocument | None:
        return await self.model.find_one({"email": email})

user_repo = UserRepository(UserDocument)
