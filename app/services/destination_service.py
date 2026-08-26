import csv
from pathlib import Path
from typing import Dict, List, Optional


DATA_FILE = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "destinations.csv"
)

PREFERENCE_FEATURES = [
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

_DESTINATIONS_CACHE: Optional[List[Dict]] = None
_DESTINATIONS_BY_ID: Optional[Dict[str, Dict]] = None


def load_destinations(force_reload: bool = False) -> List[Dict]:
    """Loads and caches all destinations from CSV."""
    global _DESTINATIONS_CACHE, _DESTINATIONS_BY_ID

    if _DESTINATIONS_CACHE is not None and not force_reload:
        return _DESTINATIONS_CACHE

    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Data file not found at {DATA_FILE}")

    destinations = []
    dest_by_id = {}

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Parse numeric fields safely
            parsed_row = dict(row)
            for feature in PREFERENCE_FEATURES:
                parsed_row[feature] = float(row.get(feature, 0) or 0)

            parsed_row["budget_level"] = int(row.get("budget_level", 2) or 2)
            parsed_row["avg_cost_per_day_inr"] = int(row.get("avg_cost_per_day_inr", 2000) or 2000)
            parsed_row["ideal_duration_days"] = int(row.get("ideal_duration_days", 3) or 3)
            parsed_row["latitude"] = float(row.get("latitude", 0.0) or 0.0)
            parsed_row["longitude"] = float(row.get("longitude", 0.0) or 0.0)
            parsed_row["popularity_score"] = float(row.get("popularity_score", 8.0) or 8.0)
            parsed_row["safety_score"] = float(row.get("safety_score", 9.0) or 9.0)

            dest_id = parsed_row.get("destination_id", "").strip().lower()
            if not dest_id:
                dest_id = parsed_row.get("destination", "").strip().lower().replace(" ", "_")
                parsed_row["destination_id"] = dest_id

            destinations.append(parsed_row)
            dest_by_id[dest_id] = parsed_row

    _DESTINATIONS_CACHE = destinations
    _DESTINATIONS_BY_ID = dest_by_id
    return _DESTINATIONS_CACHE


def get_destination_by_id(destination_id: str) -> Optional[Dict]:
    """Find a destination by exact ID or case-insensitive key."""
    load_destinations()
    if not _DESTINATIONS_BY_ID:
        return None

    cleaned_id = destination_id.strip().lower().replace(" ", "_")
    if cleaned_id in _DESTINATIONS_BY_ID:
        return _DESTINATIONS_BY_ID[cleaned_id]

    # Substring search fallback
    for dest_id, dest in _DESTINATIONS_BY_ID.items():
        if cleaned_id in dest_id or dest["destination"].lower() == destination_id.lower():
            return dest

    return None


def search_and_filter_destinations(
    query: Optional[str] = None,
    state: Optional[str] = None,
    region: Optional[str] = None,
    category: Optional[str] = None,
    budget_level: Optional[int] = None,
    max_cost_per_day: Optional[int] = None,
    ideal_for: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> Dict:
    """Filter destinations across multiple attributes with pagination."""
    all_destinations = load_destinations()
    filtered = []

    for d in all_destinations:
        if state and state.lower() not in d["state"].lower():
            continue
        if region and region.lower() != d["region"].lower():
            continue
        if category and category.lower() not in d["category"].lower():
            continue
        if budget_level is not None and d["budget_level"] != budget_level:
            continue
        if max_cost_per_day is not None and d["avg_cost_per_day_inr"] > max_cost_per_day:
            continue
        if ideal_for and ideal_for.lower() not in d["ideal_for"].lower():
            continue

        if query:
            q_lower = query.strip().lower()
            match_name = q_lower in d["destination"].lower()
            match_state = q_lower in d["state"].lower()
            match_desc = q_lower in d["description"].lower()
            match_attr = q_lower in d["top_attractions"].lower()
            match_cat = q_lower in d["category"].lower()

            if not (match_name or match_state or match_desc or match_attr or match_cat):
                continue

        filtered.append(d)

    total_count = len(filtered)
    paginated = filtered[offset : offset + limit]

    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "destinations": paginated,
    }


def format_destination_detail(dest: Dict) -> Dict:
    """Helper to convert raw dict to rich detail response with lists."""
    dest_copy = dict(dest)
    dest_copy["attractions_list"] = [
        a.strip() for a in dest.get("top_attractions", "").split(";") if a.strip()
    ]
    dest_copy["ideal_for_list"] = [
        g.strip() for g in dest.get("ideal_for", "").split(";") if g.strip()
    ]
    return dest_copy