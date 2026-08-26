"""
Context-Aware Ranking Pipeline for Tourism Recommendations.

Combines 10-D base vector similarity with travel constraints (companionship,
seasonality, budget tier alignment, safety, and popularity).
"""

from typing import Dict, List, Optional
from app.config.settings import settings
from app.services.xai import generate_xai_explanation
from app.utils.vector_ops import cosine_similarity, dict_to_preference_vector


def is_month_in_season(travel_month: str, best_months_str: str) -> bool:
    """Checks if a given travel month falls within a destination's best_months specification."""
    if not travel_month or not best_months_str:
        return False

    month_short = travel_month.strip()[:3].capitalize()
    best_str = best_months_str.lower()

    if "year-round" in best_str:
        return True

    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    if month_short not in month_names:
        return False

    month_idx = month_names.index(month_short)

    sub_ranges = best_months_str.replace(";", ",").split(",")
    for r in sub_ranges:
        r = r.strip()
        if "-" in r:
            parts = r.split("-")
            if len(parts) == 2:
                start_m = parts[0].strip()[:3].capitalize()
                end_m = parts[1].strip()[:3].capitalize()
                if start_m in month_names and end_m in month_names:
                    s_idx = month_names.index(start_m)
                    e_idx = month_names.index(end_m)
                    if s_idx <= e_idx:
                        if s_idx <= month_idx <= e_idx:
                            return True
                    else:  # Wraps around year-end e.g. Oct-Mar
                        if month_idx >= s_idx or month_idx <= e_idx:
                            return True
        elif month_short.lower() in r.lower():
            return True

    return False


def rank_destination(
    destination: Dict,
    user_prefs: Dict[str, float],
    user_vector: List[float],
    budget_level: Optional[int] = None,
    companion_type: Optional[str] = None,
    travel_month: Optional[str] = None,
    max_days: Optional[int] = None,
) -> Optional[Dict]:
    """
    Evaluates a destination through the multi-criteria ranking pipeline:
    Base Similarity -> Contextual Boosts -> Penalties -> Composite Score -> XAI Explanation
    """
    dest_vec = dict_to_preference_vector(destination)
    base_sim = cosine_similarity(user_vector, dest_vec)

    # 1. Base Similarity Component (65% weight)
    composite_score = base_sim * settings.SIMILARITY_WEIGHT

    # 2. Companion Compatibility Bonus (+5%)
    companion_match = False
    if companion_type:
        ideal_for = destination.get("ideal_for", "").lower()
        if companion_type.lower() in ideal_for:
            composite_score += settings.COMPANION_BONUS
            companion_match = True

    # 3. Seasonality Compatibility Bonus (+6%)
    in_season = False
    if travel_month:
        if is_month_in_season(travel_month, destination.get("best_months", "")):
            composite_score += settings.SEASON_BONUS
            in_season = True

    # 4. Budget Compatibility Bonus & Penalty
    dest_budget = int(destination.get("budget_level", 2))
    if budget_level:
        if dest_budget == budget_level:
            composite_score += settings.BUDGET_MATCH_BONUS
        else:
            diff = abs(dest_budget - budget_level)
            if diff == 1:
                composite_score -= settings.BUDGET_MISMATCH_PENALTY_1_TIER
            else:
                composite_score -= settings.BUDGET_MISMATCH_PENALTY_2_TIER

    # 5. Quality Index (Popularity & Safety Weighting ~5%)
    pop_score = float(destination.get("popularity_score", 8.0))
    safety_score = float(destination.get("safety_score", 8.5))
    quality_boost = ((pop_score / 10.0) * 0.025) + ((safety_score / 10.0) * 0.025)
    composite_score += quality_boost

    # Duration check (soft factor)
    if max_days and max_days > 0:
        ideal_duration = int(destination.get("ideal_duration_days", 3))
        if ideal_duration <= max_days:
            composite_score += 0.02

    # Clamp composite score to [0.0, 1.0]
    final_score = max(0.0, min(1.0, composite_score))

    # Generate Explainable AI metadata
    xai_data = generate_xai_explanation(
        user_prefs=user_prefs,
        destination=destination,
        travel_month=travel_month,
        companion_type=companion_type,
        target_budget_level=budget_level,
        in_season=in_season,
        companion_match=companion_match,
    )

    return {
        "destination_id": destination.get("destination_id"),
        "destination": destination.get("destination"),
        "state": destination.get("state"),
        "region": destination.get("region"),
        "category": destination.get("category"),
        "score": round(final_score, 4),
        "match_percentage": round(final_score * 100, 1),
        "match_score_percentage": round(final_score * 100, 1),
        "base_similarity": round(base_sim, 4),
        "budget_level": dest_budget,
        "avg_cost_per_day_inr": destination.get("avg_cost_per_day_inr"),
        "ideal_duration_days": destination.get("ideal_duration_days"),
        "best_months": destination.get("best_months"),
        "ideal_for": [g.strip() for g in destination.get("ideal_for", "").split(";") if g.strip()],
        "top_attractions": [a.strip() for a in destination.get("top_attractions", "").split(";") if a.strip()],
        "latitude": destination.get("latitude"),
        "longitude": destination.get("longitude"),
        "popularity_score": pop_score,
        "safety_score": safety_score,
        "why_recommended": xai_data["summary"],
        "xai": xai_data,
        "description": destination.get("description"),
    }
