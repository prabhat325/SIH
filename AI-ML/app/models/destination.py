from typing import List, Optional
from pydantic import BaseModel, Field


class DestinationBase(BaseModel):
    destination_id: str
    destination: str
    state: str
    region: str
    category: str
    budget_level: int = Field(..., ge=1, le=3, description="1=Budget, 2=Moderate, 3=Luxury")
    avg_cost_per_day_inr: int
    ideal_duration_days: int
    nature: float = Field(0, ge=0, le=5)
    history: float = Field(0, ge=0, le=5)
    adventure: float = Field(0, ge=0, le=5)
    food: float = Field(0, ge=0, le=5)
    beach: float = Field(0, ge=0, le=5)
    culture: float = Field(0, ge=0, le=5)
    relaxation: float = Field(0, ge=0, le=5)
    wildlife: float = Field(0, ge=0, le=5)
    spirituality: float = Field(0, ge=0, le=5)
    nightlife: float = Field(0, ge=0, le=5)
    best_months: str
    ideal_for: str
    top_attractions: str
    latitude: float
    longitude: float
    popularity_score: float
    safety_score: float
    description: str


class DestinationDetail(DestinationBase):
    attractions_list: List[str] = []
    ideal_for_list: List[str] = []


class DestinationFilterParams(BaseModel):
    state: Optional[str] = None
    region: Optional[str] = None
    category: Optional[str] = None
    budget_level: Optional[int] = Field(None, ge=1, le=3)
    max_cost_per_day: Optional[int] = None
    ideal_for: Optional[str] = None
    search: Optional[str] = None
    limit: int = Field(20, ge=1, le=250)
    offset: int = Field(0, ge=0)
