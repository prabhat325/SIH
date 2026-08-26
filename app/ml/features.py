"""
Feature Engineering Pipelines for Tabular Machine Learning Models.

Transforms destination attributes, traveler constraints, and environmental
variables into clean numeric feature vectors for budget, crowd, and reranking models.
"""

from typing import Dict, List, Optional, Tuple, Union
import numpy as np
from app.config.settings import settings


MONTH_INDEX = {
    "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
    "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
}

REGION_INDEX = {
    "North": 1, "South": 2, "East": 3, "West": 4, "North-East": 5, "Central": 6,
}

CATEGORY_INDEX = {
    "Hill Station": 1, "Heritage": 2, "Beach": 3, "Spiritual": 4,
    "Nature": 5, "Wildlife": 6, "Adventure": 7, "Culture": 8,
}

TIER_INDEX = {"budget": 1, "moderate": 2, "luxury": 3}


def extract_budget_features(
    destination: Dict,
    days: int,
    group_size: int,
    budget_tier: str = "moderate",
    travel_month: Optional[str] = "Nov",
    is_peak_season: bool = False,
) -> np.ndarray:
    """
    Constructs a 10-feature numeric array for budget regression:
    [avg_daily_cost, days, group_size, tier_code, region_code, category_code,
     popularity_score, safety_score, month_idx, is_peak_flag]
    """
    avg_cost = float(destination.get("avg_cost_per_day_inr", 2500))
    tier_code = TIER_INDEX.get(budget_tier.lower().strip(), 2)
    region_code = REGION_INDEX.get(destination.get("region", "North"), 1)
    cat_code = CATEGORY_INDEX.get(destination.get("category", "Heritage"), 2)
    pop = float(destination.get("popularity_score", 8.0))
    safety = float(destination.get("safety_score", 8.5))

    m_str = (travel_month or "Nov").strip()[:3].capitalize()
    m_idx = MONTH_INDEX.get(m_str, 11)
    peak_flag = 1.0 if is_peak_season else 0.0

    features = [
        avg_cost,
        float(days),
        float(group_size),
        float(tier_code),
        float(region_code),
        float(cat_code),
        pop,
        safety,
        float(m_idx),
        peak_flag,
    ]
    return np.array(features, dtype=np.float64)


def extract_crowd_features(
    destination: Dict,
    month: str,
    is_peak_season: bool,
    weather_score: float,
) -> np.ndarray:
    """
    Constructs an 8-feature numeric array for tourist footfall prediction:
    [popularity_score, region_code, category_code, month_idx, is_peak_flag,
     weather_score, base_budget_level, safety_score]
    """
    pop = float(destination.get("popularity_score", 8.0))
    region_code = REGION_INDEX.get(destination.get("region", "North"), 1)
    cat_code = CATEGORY_INDEX.get(destination.get("category", "Heritage"), 2)
    m_str = month.strip()[:3].capitalize()
    m_idx = MONTH_INDEX.get(m_str, 11)
    peak_flag = 1.0 if is_peak_season else 0.0
    budget_lvl = float(destination.get("budget_level", 2))
    safety = float(destination.get("safety_score", 8.5))

    features = [
        pop,
        float(region_code),
        float(cat_code),
        float(m_idx),
        peak_flag,
        float(weather_score),
        budget_lvl,
        safety,
    ]
    return np.array(features, dtype=np.float64)
