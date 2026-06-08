from typing import Any, Generic, TypeVar

from beanie import Document
from pydantic import BaseModel

ModelType = TypeVar("ModelType", bound=Document)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: type[ModelType]):
        self.model = model

    async def get(self, id: Any) -> ModelType | None:
        return await self.model.get(id)

    async def get_multi(self, skip: int = 0, limit: int = 100, **kwargs: Any) -> list[ModelType]:
        query = self.model.find(**kwargs) if kwargs else self.model.find_all()
        return await query.skip(skip).limit(limit).to_list()

    async def create(self, obj_in: CreateSchemaType | dict[str, Any]) -> ModelType:
        obj_in_data = obj_in.model_dump() if isinstance(obj_in, BaseModel) else obj_in
        db_obj = self.model(**obj_in_data)
        await db_obj.insert()
        return db_obj

    async def update(
        self,
        db_obj: ModelType,
        obj_in: UpdateSchemaType | dict[str, Any]
    ) -> ModelType:
        obj_data = db_obj.model_dump()
        update_data = obj_in.model_dump(exclude_unset=True) if isinstance(obj_in, BaseModel) else obj_in

        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])

        await db_obj.save()
        return db_obj

    async def delete(self, id: Any) -> ModelType | None:
        obj = await self.model.get(id)
        if obj:
            await obj.delete()
        return obj
