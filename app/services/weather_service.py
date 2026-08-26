"""
Weather Service & Climate Suitability Scoring.

Provides seasonal weather diagnostics, comfort index calculation, and
travel advisories based on destination geography and regional climate cycles.
"""

from typing import Dict, Optional
from app.config.settings import settings


MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def get_weather_suitability(
    destination: Dict,
    month: Optional[str] = None,
) -> Dict:
    """
    Computes climate comfort and weather suitability (1.0 to 10.0) based on
    destination region, category, and queried travel month.
    """
    if not month:
        month = "Nov"
    else:
        month = month.strip()[:3].capitalize()
        if month not in MONTHS:
            month = "Nov"

    category = destination.get("category", "")
    region = destination.get("region", "")
    state = destination.get("state", "")

    # Baseline weather diagnostics based on Indian meteorological cycles
    if category == "Hill Station" or "Ladakh" in state or region == "North-East":
        if month in ["Dec", "Jan", "Feb"]:
            temp_range = "-5°C to 10°C"
            condition = "Sub-zero / Chilly with snowfall & frost"
            suitability = 8.5 if category == "Hill Station" else 6.0
            comfort_tag = "Winter Snow Season"
        elif month in ["Mar", "Apr", "May", "Jun"]:
            temp_range = "14°C to 24°C"
            condition = "Pleasant, clear skies & alpine breeze"
            suitability = 9.8
            comfort_tag = "Ideal Peak Weather"
        elif month in ["Jul", "Aug"]:
            temp_range = "15°C to 22°C"
            condition = "Monsoon showers with lush greenery (Landslide watch)"
            suitability = 6.2
            comfort_tag = "Monsoon Caution"
        else:  # Sep, Oct, Nov
            temp_range = "8°C to 18°C"
            condition = "Crisp autumn air, golden sunshine & great visibility"
            suitability = 9.5
            comfort_tag = "Golden Autumn Season"

    elif category == "Beach" or region in ["South", "West"]:
        if month in ["Nov", "Dec", "Jan", "Feb"]:
            temp_range = "20°C to 30°C"
            condition = "Sunny, gentle coastal sea breeze & calm waters"
            suitability = 9.6
            comfort_tag = "Prime Beach Weather"
        elif month in ["Mar", "Apr", "May"]:
            temp_range = "26°C to 36°C"
            condition = "Humid and tropical sunshine"
            suitability = 7.0
            comfort_tag = "Warm Tropical"
        elif month in ["Jun", "Jul", "Aug", "Sep"]:
            temp_range = "24°C to 30°C"
            condition = "Lush southwest monsoon rains & high tides"
            suitability = 6.5
            comfort_tag = "Coastal Monsoon"
        else:
            temp_range = "22°C to 32°C"
            condition = "Post-monsoon freshness & clear sunsets"
            suitability = 9.0
            comfort_tag = "Pleasant Post-Monsoon"

    else:  # Heritage, Spiritual, Plains, Desert
        if month in ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]:
            temp_range = "12°C to 26°C"
            condition = "Cool, pleasant & comfortable for heritage walks"
            suitability = 9.5
            comfort_tag = "Prime Sightseeing Climate"
        elif month in ["Apr", "May", "Jun"]:
            temp_range = "32°C to 44°C"
            condition = "Intense summer heat & dry afternoon winds"
            suitability = 4.8
            comfort_tag = "Severe Summer Heat"
        else:  # Jul, Aug, Sep
            temp_range = "26°C to 33°C"
            condition = "Monsoon rain showers with high humidity"
            suitability = 7.2
            comfort_tag = "Lush Humid Monsoon"

    return {
        "month": month,
        "temperature_range": temp_range,
        "condition": condition,
        "suitability_score": round(suitability, 1),
        "comfort_tag": comfort_tag,
    }
