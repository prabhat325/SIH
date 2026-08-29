from typing import Optional
from fastapi import APIRouter, Query
from app.models.crowd import CrowdForecastResponse
from app.services.crowd_service import predict_crowd_and_seasonality

router = APIRouter(prefix="/crowd", tags=["Crowd & Seasonality Predictor"])


@router.get("/forecast", response_model=CrowdForecastResponse, summary="Predict Crowd Density & Seasonality by Destination")
def get_crowd_prediction(
    destination_id: Optional[str] = Query(None, description="Destination ID (e.g. 'goa', 'jaipur')"),
    destination_name: Optional[str] = Query(None, description="Destination Name if ID is unknown"),
    month: Optional[str] = Query(None, description="Month of travel (e.g. 'Jan', 'Jul', 'Dec')"),
):
    """
    Returns crowd levels, 12-month trend matrix, weather suitability,
    and overtourism advisories to plan optimal trip timing.
    """
    result = predict_crowd_and_seasonality(
        destination_id=destination_id,
        destination_name=destination_name,
        query_month=month,
    )
    return result


@router.get("/{destination_id}", response_model=CrowdForecastResponse, summary="Get Crowd Forecast for a specific Destination ID")
def get_crowd_by_id(
    destination_id: str,
    month: Optional[str] = Query(None, description="Month of travel (e.g. 'Jan', 'May', 'Dec')"),
):
    """Returns crowd and weather forecasting for a specific destination ID."""
    result = predict_crowd_and_seasonality(
        destination_id=destination_id,
        query_month=month,
    )
    return result
