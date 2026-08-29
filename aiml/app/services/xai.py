"""
Explainable AI (XAI) Engine for Tourism Recommendations.

Computes mathematical feature contributions (User_i * Destination_i) across
10 travel dimensions, detects contextual positive alignments, and surfaces
transparent warnings (budget mismatch, peak crowd, off-season climate).
"""

from typing import Dict, List, Optional, Tuple
from app.config.settings import settings


def compute_feature_contributions(
    user_prefs: Dict[str, float],
    dest_features: Dict[str, float],
) -> List[Tuple[str, float]]:
    """
    Calculates mathematical contribution for all 10 dimensions:
    Contribution_i = User_i * Destination_i
    Returns sorted list of (feature_name, contribution_value) descending.
    """
    contributions = []
    for feat in settings.PREFERENCE_FEATURES:
        u_val = float(user_prefs.get(feat, 0.0))
        d_val = float(dest_features.get(feat, 0.0))
        contrib = u_val * d_val
        contributions.append((feat, round(contrib, 2)))

    contributions.sort(key=lambda x: x[1], reverse=True)
    return contributions


def generate_xai_explanation(
    user_prefs: Dict[str, float],
    destination: Dict,
    travel_month: Optional[str] = None,
    companion_type: Optional[str] = None,
    target_budget_level: Optional[int] = None,
    in_season: bool = False,
    companion_match: bool = False,
    weather_score: Optional[float] = None,
    crowd_level: Optional[str] = None,
) -> Dict:
    """
    Generates a structured, explainable AI payload including:
    - Top driving preference dimensions (XAI feature contributions)
    - Positive contextual checkmarks (why it's a great match)
    - Potential cautionary warnings (budget, crowd, off-season)
    - A human-readable summary narrative
    """
    contributions = compute_feature_contributions(user_prefs, destination)

    # Top positive feature drivers with non-zero contribution
    top_drivers = [feat.capitalize() for feat, score in contributions if score >= 6.0]
    if not top_drivers:
        top_drivers = [feat.capitalize() for feat, score in contributions[:2] if score > 0]

    positive_factors: List[str] = []
    cautions: List[str] = []

    # 1. Preference Dimensions
    if top_drivers:
        positive_factors.append(f"Strong match for your {' & '.join(top_drivers[:2])} interests")

    # 2. Companion Alignment
    if companion_match and companion_type:
        positive_factors.append(f"Highly recommended for {companion_type.capitalize()} travel")

    # 3. Seasonality
    if travel_month:
        if in_season:
            positive_factors.append(f"Peak travel window in {travel_month.capitalize()}")
        else:
            best_months = destination.get("best_months", "Year-round")
            cautions.append(f"Off-peak/monsoon season in {travel_month.capitalize()} (Best: {best_months})")

    # 4. Budget Compatibility
    dest_budget = int(destination.get("budget_level", 2))
    if target_budget_level:
        if target_budget_level == dest_budget:
            positive_factors.append("Perfect alignment with your budget tier")
        elif target_budget_level < dest_budget:
            cautions.append(f"Higher than your target budget (Tier {dest_budget} vs requested Tier {target_budget_level})")

    # 5. Safety & Quality
    safety = float(destination.get("safety_score", 8.5))
    if safety >= 9.0:
        positive_factors.append(f"Excellent tourist safety rating ({safety}/10)")

    # 6. Crowd / Weather Warnings
    if crowd_level and ("Peak" in crowd_level or "Very High" in crowd_level):
        cautions.append("High crowd pressure expected at popular spots")

    if weather_score is not None and weather_score < 6.0:
        cautions.append(f"Moderate weather suitability score ({weather_score}/10)")

    # Construct human-readable summary
    summary_parts = []
    if top_drivers:
        summary_parts.append(f"Strong match for your interest in {' & '.join(top_drivers[:2])}.")
    if companion_match and companion_type:
        summary_parts.append(f"Ideal destination for {companion_type.capitalize()} travelers.")
    if in_season and travel_month:
        summary_parts.append(f"Best explored during {travel_month.capitalize()}.")
    else:
        best_m = destination.get("best_months", "")
        if best_m:
            summary_parts.append(f"Best explored in {best_m}.")

    narrative = " ".join(summary_parts) if summary_parts else f"Recommended destination in {destination.get('state', 'India')}."

    return {
        "summary": narrative,
        "top_contributing_features": [
            {"feature": feat, "contribution_score": score} for feat, score in contributions[:5]
        ],
        "positive_factors": positive_factors,
        "cautions": cautions,
    }
