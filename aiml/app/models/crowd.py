"""
Pydantic Schemas for Crowd Forecasting & Seasonality.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class MonthForecast(BaseModel):
    crowd_level: str
    footfall_index: float
    weather_condition: str
    temperature_range: Optional[str] = None
    weather_suitability_score: Optional[float] = None
    overall_suitability_score: float
    advisory: str


class OvertourismMitigation(BaseModel):
    best_month: str
    recommended_shoulder_month: str
    reason: str


class CrowdForecastResponse(BaseModel):
    status: str = "success"
    destination_id: str
    destination: str
    state: str
    category: str
    query_month: str
    crowd_level: str = Field(..., description="'Low', 'Moderate', 'High', or 'Peak / Overcrowded'")
    crowd_index: float = Field(..., ge=0.0, le=10.0, description="Footfall intensity from 0.0 to 10.0")
    weather_condition: str
    travel_suitability_score: float = Field(..., ge=0.0, le=10.0)
    best_time_to_visit: str
    monthly_trend: Dict[str, str]
    overtourism_advisory: str
    smart_crowd_tips: List[str]
    current_month_forecast: Optional[MonthForecast] = None
    overtourism_mitigation: Optional[OvertourismMitigation] = None
    twelve_month_trend: Optional[Dict[str, Any]] = None
