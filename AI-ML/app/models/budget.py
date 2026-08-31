"""
Pydantic Schemas for Predictive Travel Budget Estimation.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class CostBreakdown(BaseModel):
    accommodation_inr: int
    food_and_dining_inr: int
    local_transport_inr: int
    activities_and_entry_fees_inr: int
    miscellaneous_and_shopping_inr: int


class BudgetEstimateRequest(BaseModel):
    destination_id: Optional[str] = Field(None, description="Destination ID (e.g. 'goa', 'jaipur')")
    destination_name: Optional[str] = Field(None, description="Destination Name if ID is unknown")
    days: int = Field(3, ge=1, le=30, description="Duration in days")
    group_size: int = Field(1, ge=1, le=50, description="Number of travelers")
    tier: str = Field("moderate", description="'budget', 'moderate', or 'luxury'")
    travel_month: Optional[str] = Field(None, description="Month of travel (e.g. 'Dec', 'May')")


class BudgetEstimateResponse(BaseModel):
    status: str = "success"
    destination_id: str
    destination: str
    state: str
    days: int
    group_size: int
    tier: str
    estimator_used: Optional[str] = "GradientBoosting Regressor (ML)"
    season_factor_applied: str
    breakdown: CostBreakdown
    itemized_breakdown: Optional[Dict[str, int]] = None
    total_estimated_cost_inr: int
    cost_per_person_inr: int
    budget_range_min_inr: int
    budget_range_max_inr: int
    money_saving_tips: List[str]
