from typing import List, Optional
from pydantic import BaseModel, Field


class ActivitySlot(BaseModel):
    time: str
    activity_title: str
    attraction_name: str
    description: str
    duration_hours: float
    pro_tip: str
    estimated_transit_mins: Optional[int] = 0


class MealRecommendation(BaseModel):
    breakfast: str
    lunch: str
    dinner: str
    must_try_dish: str


class DayPlan(BaseModel):
    day: int
    title: str
    theme: str
    morning: ActivitySlot
    afternoon: ActivitySlot
    evening: ActivitySlot
    meals: MealRecommendation
    estimated_day_budget_inr: int


class ItineraryRequest(BaseModel):
    destination_id: Optional[str] = Field(None, description="Destination ID (e.g. 'jaipur', 'munnar', 'manali')")
    destination_name: Optional[str] = Field(None, description="Destination Name if ID is unknown")
    days: int = Field(3, ge=1, le=10, description="Total days for the trip (1-10)")
    pace: str = Field("moderate", description="'relaxed', 'moderate', or 'packed'")
    companion_type: str = Field("Solo", description="'Solo', 'Couple', 'Family', 'Friends', 'Backpacker'")
    budget_tier: str = Field("moderate", description="'budget', 'moderate', or 'luxury'")
    interests: Optional[List[str]] = Field(default=[], description="List of focus areas, e.g. ['nature', 'photography', 'food']")


class ItineraryResponse(BaseModel):
    status: str = "success"
    destination_id: str
    destination: str
    state: str
    region: str
    total_days: int
    pace: str
    companion_type: str
    budget_tier: str
    estimated_total_cost_inr: int
    daily_itinerary: List[DayPlan]
    essential_travel_tips: List[str]
    best_time_to_visit: str
