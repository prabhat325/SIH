"""
Content-Based Item-to-Item Similarity Service.

Finds alternative destinations across India with comparable vibe, landscape,
and activity vectors to a reference place (e.g. Manali -> Dalhousie, Bir Billing).
"""

from typing import Dict, List, Optional
from app.services.destination_service import (
    get_destination_by_id,
    load_destinations,
)
from app.utils.vector_ops import (
    cosine_similarity,
    dict_to_preference_vector,
)


def get_similar_destinations(
    destination_id: str,
    top_n: int = 5,
    same_state: Optional[bool] = None,
) -> List[Dict]:
    """
    Computes 10-D content-based item-to-item similarity against all destinations in the catalog.
    Excludes the source destination itself from recommendations.
    """
    target = get_destination_by_id(destination_id)
    if not target:
        return []

    target_vector = dict_to_preference_vector(target)
    all_destinations = load_destinations()
    target_id_clean = target.get("destination_id", "").strip().lower()

    scored = []
    for d in all_destinations:
        curr_id = d.get("destination_id", "").strip().lower()
        if curr_id == target_id_clean:
            continue

        if same_state is not None:
            if same_state and d.get("state") != target.get("state"):
                continue
            if not same_state and d.get("state") == target.get("state"):
                continue

        d_vec = dict_to_preference_vector(d)
        sim = cosine_similarity(target_vector, d_vec)

        # Minor category boost (+2%) if same travel style (e.g. Hill Station)
        category_boost = 0.02 if d.get("category") == target.get("category") else 0.0
        final_sim = min(1.0, sim + category_boost)

        scored.append((final_sim, d))

    scored.sort(key=lambda x: x[0], reverse=True)

    results = []
    for sim_score, d in scored[:top_n]:
        results.append({
            "destination_id": d.get("destination_id"),
            "destination": d.get("destination"),
            "state": d.get("state"),
            "region": d.get("region"),
            "category": d.get("category"),
            "similarity_score": round(sim_score, 4),
            "match_percentage": round(sim_score * 100, 1),
            "match_score_percentage": round(sim_score * 100, 1),
            "avg_cost_per_day_inr": d.get("avg_cost_per_day_inr"),
            "ideal_duration_days": d.get("ideal_duration_days"),
            "best_months": d.get("best_months"),
            "top_attractions": [a.strip() for a in d.get("top_attractions", "").split(";") if a.strip()],
            "description": d.get("description"),
        })

    return results
