from fastapi import APIRouter, HTTPException
from app.models.recommendation import (
    RecommendationItem,
    RecommendationRequest,
    RecommendationResponse,
    SimilarDestinationRequest,
)
from app.services.recommender import get_recommendations, get_similar_destinations

router = APIRouter(prefix="/recommend", tags=["AI Recommendations"])


@router.post("", response_model=RecommendationResponse, summary="Multi-Criteria AI Destination Recommendation")
def recommend_places(payload: RecommendationRequest):
    """
    Computes top-matched Indian travel destinations using:
    - 10-Dimensional Cosine Similarity Preference Matching.
    - Contextual boosting for travel companionship, travel month/season, and budget.
    - Quality weighting on popularity & safety scores.
    """
    user_prefs_dict = payload.preferences.model_dump()

    results = get_recommendations(
        user_preferences=user_prefs_dict,
        budget_level=payload.budget_level,
        region=payload.region,
        state=payload.state,
        category=payload.category,
        companion_type=payload.companion_type,
        travel_month=payload.travel_month,
        max_days=payload.max_days,
        top_n=payload.top_n,
    )

    return {
        "status": "success",
        "total_results": len(results),
        "results": results,
    }


@router.post("/similar", summary="Find Similar Destinations (Item-to-Item Similarity)")
def recommend_similar_places(payload: SimilarDestinationRequest):
    """
    Finds alternative or similar destinations across India with comparable vibe,
    landscape, and activities to a reference destination (e.g. 'manali' -> 'kasol', 'jibhi').
    """
    results = get_similar_destinations(
        destination_id=payload.destination_id,
        top_n=payload.top_n,
    )

    if not results:
        raise HTTPException(
            status_code=404,
            detail=f"No similar destinations found for '{payload.destination_id}'."
        )

    return {
        "status": "success",
        "reference_destination_id": payload.destination_id,
        "total_similar_found": len(results),
        "results": results,
    }
