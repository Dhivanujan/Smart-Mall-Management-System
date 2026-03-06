from pydantic import BaseModel


class StoreSummary(BaseModel):
	id: int
	name: str
	category: str
	status: str
	average_rating: float
	current_footfall: int
	current_occupancy_percent: float


class ProductSummary(BaseModel):
	id: int
	name: str
	price: float
	category: str
