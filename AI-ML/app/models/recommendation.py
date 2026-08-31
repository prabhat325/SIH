"""
Pydantic Schemas for Multi-Criteria AI Recommendation & Item Similarity.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class PreferenceVector(BaseModel):
    nature: float = Field(0.0, ge=0.0, le=5.0, description="Preference for nature, mountains, lakes (0-5)")
    history: float = Field(0.0, ge=0.0, le=5.0, description="Preference for monuments, forts, palaces (0-5)")
    adventure: float = Field(0.0, ge=0.0, le=5.0, description="Preference for trekking, rafting, skiing (0-5)")
    food: float = Field(0.0, ge=0.0, le=5.0, description="Preference for cuisine, street food walks (0-5)")
    beach: float = Field(0.0, ge=0.0, le=5.0, description="Preference for coastlines, water sports (0-5)")
    culture: float = Field(0.0, ge=0.0, le=5.0, description="Preference for festivals, local crafts, art (0-5)")
    relaxation: float = Field(0.0, ge=0.0, le=5.0, description="Preference for peaceful stays, wellness (0-5)")
    wildlife: float = Field(0.0, ge=0.0, le=5.0, description="Preference for safaris, national parks (0-5)")
    spirituality: float = Field(0.0, ge=0.0, le=5.0, description="Preference for temples, ghats, yoga (0-5)")
    nightlife: float = Field(0.0, ge=0.0, le=5.0, description="Preference for cafes, pubs, night markets (0-5)")


class RecommendationRequest(BaseModel):
    preferences: PreferenceVector
    budget_level: Optional[int] = Field(None, ge=1, le=3, description="1=Budget, 2=Moderate, 3=Luxury")
    region: Optional[str] = Field(None, description="Filter by North, South, East, West, North-East, Central")
    state: Optional[str] = Field(None, description="Filter by State (e.g. Rajasthan, Kerala)")
    category: Optional[str] = Field(None, description="Filter by Category (e.g. Hill Station, Beach, Heritage)")
    companion_type: Optional[str] = Field(None, description="Travel group: Solo, Couple, Family, Friends, Backpacker")
    travel_month: Optional[str] = Field(None, description="Planned month, e.g. Nov, Dec, May")
    max_days: Optional[int] = Field(None, ge=1, le=30, description="Max trip duration in days")
    top_n: int = Field(5, ge=1, le=50, description="Number of recommendations to return")


class XAIExplanation(BaseModel):
    summary: str
    top_contributing_features: List[Dict[str, Any]]
    positive_factors: List[str]
    cautions: List[str]


class RecommendationItem(BaseModel):
    destination_id: str
    destination: str
    state: str
    region: str
    category: str
    score: float
    match_percentage: float
    match_score_percentage: Optional[float] = None
    base_similarity: float
    budget_level: int
    avg_cost_per_day_inr: int
    ideal_duration_days: int
    best_months: str
    ideal_for: List[str]
    top_attractions: List[str]
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    popularity_score: float
    safety_score: float
    why_recommended: str
    xai: Optional[XAIExplanation] = None
    description: str


class RecommendationResponse(BaseModel):
    status: str = "success"
    total_results: int
    results: List[RecommendationItem]


class SimilarDestinationRequest(BaseModel):
    destination_id: str = Field(..., description="ID of reference destination (e.g. 'manali' or 'goa')")
    top_n: int = Field(5, ge=1, le=20)
    same_state: Optional[bool] = Field(None, description="Filter alternatives within the same state (true) or outside (false)")
