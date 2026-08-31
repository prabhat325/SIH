from fastapi import APIRouter
from app.models.itinerary import ItineraryRequest, ItineraryResponse
from app.services.itinerary_service import generate_itinerary

router = APIRouter(prefix="/itinerary", tags=["AI Itinerary Planner"])


@router.post("/generate", response_model=ItineraryResponse, summary="Generate Day-by-Day Customized Travel Itinerary")
def create_itinerary(payload: ItineraryRequest):
    """
    Generates a complete day-by-day travel plan featuring:
    - Morning, Afternoon, and Evening activities with real top attractions.
    - Pacing adjustment (relaxed, moderate, packed).
    - Authentic regional meal & cuisine recommendations.
    - Day-by-day budget estimates and essential travel safety tips.
    """
    plan = generate_itinerary(
        destination_id=payload.destination_id,
        destination_name=payload.destination_name,
        days=payload.days,
        pace=payload.pace,
        companion_type=payload.companion_type,
        budget_tier=payload.budget_tier,
        interests=payload.interests,
    )
    return plan
