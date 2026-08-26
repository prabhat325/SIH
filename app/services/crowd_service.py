"""
Crowd Forecasting, Seasonality & Overtourism Prevention Service.

Combines ML footfall regression with climate diagnostics to compute
comprehensive 12-month travel suitability matrices and recommend off-peak travel windows.
"""

from datetime import datetime
from typing import Dict, List, Optional
from app.config.settings import settings
from app.ml.crowd_model import predict_crowd_footfall
from app.services.destination_service import get_destination_by_id, load_destinations
from app.services.recommender import is_month_in_season
from app.services.weather_service import get_weather_suitability

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def predict_crowd_and_seasonality(
    destination_id: Optional[str] = None,
    destination_name: Optional[str] = None,
    query_month: Optional[str] = None,
) -> Dict:
    """
    Predicts monthly footfall patterns, climate suitability scores, and overtourism advisories.
    """
    dest = None
    if destination_id:
        dest = get_destination_by_id(destination_id)
    if not dest and destination_name:
        dest = get_destination_by_id(destination_name)
    if not dest:
        dest = get_destination_by_id("jaipur")
        if not dest:
            dest = load_destinations()[0]

    if not query_month:
        query_month = datetime.now().strftime("%b")
    else:
        query_month = query_month.strip()[:3].capitalize()
        if query_month not in MONTHS:
            query_month = "Nov"

    best_months_str = dest.get("best_months", "")

    # Compute 12-Month Matrix
    monthly_matrix = {}
    legacy_trend = {}
    best_suitability_month = query_month
    best_suitability_score = 0.0
    recommended_shoulder_months = []

    for m in MONTHS:
        in_season = is_month_in_season(m, best_months_str)
        weather_info = get_weather_suitability(dest, m)
        w_score = weather_info["suitability_score"]

        # Run ML crowd prediction
        footfall_index, crowd_cat = predict_crowd_footfall(
            destination=dest,
            month=m,
            is_peak_season=in_season,
            weather_score=w_score,
        )

        crowd_comfort_factor = max(1.0, 10.0 - (footfall_index * 0.4))
        season_score = 10.0 if in_season else 4.0
        composite_suitability = round(
            (w_score * 0.50) + (season_score * 0.30) + (crowd_comfort_factor * 0.20),
            1,
        )

        monthly_matrix[m] = {
            "crowd_level": crowd_cat,
            "footfall_index": footfall_index,
            "weather_condition": weather_info["condition"],
            "weather_score": w_score,
            "overall_suitability_score": composite_suitability,
        }
        legacy_trend[m] = crowd_cat

        if composite_suitability > best_suitability_score:
            best_suitability_score = composite_suitability
            best_suitability_month = m

        if w_score >= 8.0 and crowd_cat in ["Low", "Moderate"]:
            recommended_shoulder_months.append(m)

    curr_data = monthly_matrix[query_month]
    w_curr = get_weather_suitability(dest, query_month)

    if "Peak" in curr_data["crowd_level"] or "High" in curr_data["crowd_level"]:
        advisory = (
            f"Expect heavy tourist rush at major landmarks in {dest['destination']}. "
            f"Early morning visits (07:00 AM - 09:00 AM) are strongly recommended."
        )
    else:
        advisory = (
            f"Moderate to low tourist footfall expected in {query_month}. Ideal time for relaxed exploration."
        )

    shoulder_alt = (
        recommended_shoulder_months[0]
        if recommended_shoulder_months
        else ("Feb" if query_month != "Feb" else "Oct")
    )

    smart_tips = [
        f"Visit popular monuments between 08:00 AM - 10:00 AM or after 04:30 PM to avoid midday peak tourist surges in {dest['destination']}.",
        "Buy entry tickets and museum passes online in advance via ASI / official tourism portals.",
        f"Consider visiting during {shoulder_alt} for excellent weather with fewer crowds.",
        "Hire verified government-approved guides at monuments to navigate crowds smoothly.",
    ]

    return {
        "status": "success",
        "destination_id": dest["destination_id"],
        "destination": dest["destination"],
        "state": dest["state"],
        "category": dest.get("category", "General"),
        "query_month": query_month,
        "crowd_level": curr_data["crowd_level"],
        "crowd_index": curr_data["footfall_index"],
        "weather_condition": w_curr["condition"],
        "travel_suitability_score": curr_data["overall_suitability_score"],
        "best_time_to_visit": dest.get("best_months", "Year-round"),
        "monthly_trend": legacy_trend,
        "overtourism_advisory": advisory,
        "smart_crowd_tips": smart_tips,
        "current_month_forecast": {
            "crowd_level": curr_data["crowd_level"],
            "footfall_index": curr_data["footfall_index"],
            "weather_condition": w_curr["condition"],
            "temperature_range": w_curr["temperature_range"],
            "weather_suitability_score": w_curr["suitability_score"],
            "overall_suitability_score": curr_data["overall_suitability_score"],
            "advisory": advisory,
        },
        "overtourism_mitigation": {
            "best_month": best_suitability_month,
            "recommended_shoulder_month": shoulder_alt,
            "reason": f"Excellent weather with noticeably lower tourist pressure compared to peak holidays.",
        },
        "twelve_month_trend": monthly_matrix,
    }
