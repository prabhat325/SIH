"""
Hybrid AI Recommender Engine for Indian Destinations.

Main orchestrator combining:
- 10-Dimensional Vector Space Preference Matching
- Contextual Ranker (companionship, seasonality, budget, quality)
- Explainable AI (XAI) feature attribution
- Item-to-Item Similarity Service
"""

from typing import Dict, List, Optional
from app.services.contextual_ranker import (
    is_month_in_season,
    rank_destination,
)
from app.services.destination_service import (
    PREFERENCE_FEATURES,
    get_destination_by_id,
    load_destinations,
)
from app.services.similarity import get_similar_destinations
from app.utils.vector_ops import (
    cosine_similarity,
    dict_to_preference_vector,
)


def get_recommendations(
    user_preferences: Dict[str, float],
    budget_level: Optional[int] = None,
    region: Optional[str] = None,
    state: Optional[str] = None,
    category: Optional[str] = None,
    companion_type: Optional[str] = None,
    travel_month: Optional[str] = None,
    max_days: Optional[int] = None,
    top_n: int = 5,
) -> List[Dict]:
    """
    Computes top-matched travel destinations using 10-D vector cosine similarity,
    contextual constraint boosting, and Explainable AI.
    """
    destinations = load_destinations()
    user_vector = dict_to_preference_vector(user_preferences)

    # If all user weights are 0, default to a balanced baseline vector
    if sum(user_vector) == 0:
        user_vector = [2.5] * len(PREFERENCE_FEATURES)
        user_preferences = {feat: 2.5 for feat in PREFERENCE_FEATURES}

    scored_places = []
    for dest in destinations:
        # Hard filters
        if region and dest.get("region", "").lower() != region.lower():
            continue
        if state and dest.get("state", "").lower() != state.lower():
            continue
        if category and dest.get("category", "").lower() != category.lower():
            continue

        result = rank_destination(
            destination=dest,
            user_prefs=user_preferences,
            user_vector=user_vector,
            budget_level=budget_level,
            companion_type=companion_type,
            travel_month=travel_month,
            max_days=max_days,
        )
        if result:
            scored_places.append(result)

    # Sort descending by composite match score
    scored_places.sort(key=lambda x: x["score"], reverse=True)

    return scored_places[:top_n]
