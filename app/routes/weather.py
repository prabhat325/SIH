"""
Weather Diagnostics & Climate Suitability API Endpoints.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.weather import WeatherResponse
from app.services.destination_service import get_destination_by_id
from app.services.weather_service import get_weather_suitability

router = APIRouter(prefix="/weather", tags=["Weather & Climate Suitability"])


@router.get("/{destination_id}", response_model=WeatherResponse, summary="Get Weather Suitability for Destination")
def get_destination_weather(
    destination_id: str,
    month: Optional[str] = Query(None, description="Month of travel (e.g. Nov, Dec, May)"),
):
    """
    Returns climate diagnostics, comfort index, and weather suitability score (0-10)
    for a destination during a specific month.
    """
    dest = get_destination_by_id(destination_id)
    if not dest:
        raise HTTPException(
            status_code=404,
            detail=f"Destination '{destination_id}' not found."
        )

    weather_data = get_weather_suitability(dest, month)
    return {
        "status": "success",
        "destination_id": dest["destination_id"],
        "destination": dest["destination"],
        "state": dest["state"],
        **weather_data,
    }
