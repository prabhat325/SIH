"""
Pydantic Schemas for User Feedback & Interaction Logging.
"""

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class FeedbackEventRequest(BaseModel):
    user_id: str = Field(..., description="Unique user or session identifier", example="user_101")
    destination_id: str = Field(..., description="Target destination ID", example="manali")
    event_type: str = Field(
        ...,
        description="Event type: destination_liked, destination_saved, destination_rejected, recommendation_viewed, itinerary_generated",
        example="destination_liked",
    )
    rating: Optional[float] = Field(None, ge=1.0, le=5.0, description="Optional explicit rating", example=4.5)
    context: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Contextual metadata (e.g. companion_type, budget_tier, travel_month)",
        example={"companion_type": "Friends", "travel_month": "Nov", "budget_tier": "moderate"},
    )


class FeedbackResponse(BaseModel):
    status: str
    interaction_id: int
    user_id: str
    destination_id: str
    event_type: str
    timestamp: str
