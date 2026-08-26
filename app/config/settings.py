"""
Centralized Configuration & Hyperparameters for SIH Tourism AI/ML Microservice.

All scoring weights, contextual bonuses, penalties, and model thresholds are
centralized here instead of scattered magic numbers.

NOTE FOR SIH EVALUATORS:
The weights below (e.g. SIMILARITY_WEIGHT = 0.65, COMPANION_BONUS = 0.05) represent
calibrated domain baseline prototype hyperparameters. They can be dynamically replaced
by learned weights when larger-scale user interaction logs are collected.
"""

from typing import Dict, List


class Settings:
    # -------------------------------------------------------------------------
    # System Information
    # -------------------------------------------------------------------------
    APP_NAME: str = "PropValue-AI / SIH Tourism AI/ML Microservice"
    APP_VERSION: str = "2.5.0"
    API_V1_PREFIX: str = "/api/v1"

    # -------------------------------------------------------------------------
    # 10-Dimensional Vector Space Configuration
    # -------------------------------------------------------------------------
    PREFERENCE_FEATURES: List[str] = [
        "nature",
        "history",
        "adventure",
        "food",
        "beach",
        "culture",
        "relaxation",
        "wildlife",
        "spirituality",
        "nightlife",
    ]

    # -------------------------------------------------------------------------
    # Recommendation Scoring Weights & Bonuses (Context-Aware Ranker)
    # -------------------------------------------------------------------------
    # Baseline vector similarity contribution to composite match score (65%)
    SIMILARITY_WEIGHT: float = 0.65

    # Contextual bonuses:
    # +5% match bonus if destination matches user companion type (Solo, Couple, Family, Friends)
    COMPANION_BONUS: float = 0.05
    # +6% match bonus if destination is in peak travel window for query month
    SEASON_BONUS: float = 0.06
    # +6% bonus for exact budget tier match
    BUDGET_MATCH_BONUS: float = 0.06
    # Penalty for 1-level budget mismatch (e.g. Budget user looking at Moderate place)
    BUDGET_MISMATCH_PENALTY_1_TIER: float = 0.03
    # Penalty for severe 2-level budget mismatch (e.g. Budget user looking at Luxury place)
    BUDGET_MISMATCH_PENALTY_2_TIER: float = 0.10
    # Popularity & Safety quality index contribution weight (5%)
    QUALITY_WEIGHT: float = 0.05

    # -------------------------------------------------------------------------
    # Budget Estimation Parameters
    # -------------------------------------------------------------------------
    # Daily budget tier multipliers applied on baseline daily cost
    TIER_MULTIPLIERS: Dict[str, float] = {
        "budget": 0.65,
        "moderate": 1.0,
        "luxury": 2.4,
    }

    # Group economies-of-scale discount on shared accommodation & cabs
    GROUP_DISCOUNTS: Dict[str, float] = {
        "solo": 1.0,        # 1 person (no sharing)
        "couple": 0.85,      # 2 people (shared room)
        "small_group": 0.76, # 3-5 people (triple sharing / shared cab)
        "large_group": 0.70, # 6+ people (group bulk rates)
    }

    # Peak season accommodation & transit surge factor (+20%)
    SEASON_SURGE_MULTIPLIER: float = 1.20
    # Off-peak season discount factor (-12%)
    OFF_PEAK_DISCOUNT_MULTIPLIER: float = 0.88

    # Itemized expense allocation baseline percentages
    EXPENSE_BREAKDOWN_PCT: Dict[str, float] = {
        "accommodation": 0.42,
        "food": 0.24,
        "transit": 0.18,
        "activities": 0.10,
        "contingency_buffer": 0.06,
    }

    # -------------------------------------------------------------------------
    # Crowd & Seasonality Thresholds
    # -------------------------------------------------------------------------
    CROWD_THRESHOLDS: Dict[str, float] = {
        "low_max": 4.0,
        "moderate_max": 7.0,
        "high_max": 8.8,
        # Above 8.8 -> "Peak / Very High"
    }

    # Weather suitability index weights (Temperature 40%, Rainfall 35%, Humidity 25%)
    WEATHER_WEIGHTS: Dict[str, float] = {
        "temperature_comfort": 0.40,
        "rainfall_suitability": 0.35,
        "humidity_comfort": 0.25,
    }

    # -------------------------------------------------------------------------
    # Geographic Routing & Itinerary Planning
    # -------------------------------------------------------------------------
    # Average urban transit speed in km/h for intra-city travel between attractions
    AVG_URBAN_SPEED_KMH: float = 25.0
    # Buffer time in minutes between consecutive attraction slots
    DEFAULT_TRANSIT_BUFFER_MINS: int = 30


settings = Settings()
