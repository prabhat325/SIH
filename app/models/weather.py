"""
Pydantic Schemas for Weather Diagnostics & Climate Suitability.
"""

from typing import Optional
from pydantic import BaseModel, Field


class WeatherResponse(BaseModel):
    status: str
    destination_id: str
    destination: str
    state: str
    month: str
    temperature_range: str
    condition: str
    suitability_score: float = Field(..., ge=0.0, le=10.0)
    comfort_tag: str
