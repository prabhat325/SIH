import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.budget_service import estimate_trip_budget
from app.services.crowd_service import predict_crowd_and_seasonality
from app.services.destination_service import (
    get_destination_by_id,
    load_destinations,
    search_and_filter_destinations,
)
from app.services.itinerary_service import generate_itinerary
from app.services.recommender import get_recommendations, get_similar_destinations


def test_dataset_integrity():
    print("\n--- 1. Testing Dataset Integrity ---")
    destinations = load_destinations(force_reload=True)
    assert len(destinations) >= 150, f"Expected 150+ places, found {len(destinations)}"
    print(f"[PASS] Dataset Loaded: {len(destinations)} destinations verified across India.")

    states = set(d["state"] for d in destinations)
    regions = set(d["region"] for d in destinations)
    print(f"[PASS] Geographical Coverage: {len(states)} States/UTs, Regions: {regions}")

    sample = destinations[0]
    required_keys = [
        "destination_id", "destination", "state", "region", "category",
        "budget_level", "avg_cost_per_day_inr", "nature", "history",
        "adventure", "food", "beach", "culture", "relaxation",
        "wildlife", "spirituality", "nightlife", "top_attractions"
    ]
    for key in required_keys:
        assert key in sample, f"Missing key '{key}' in dataset"
    print("[PASS] Schema Validation: All required feature vectors present.")


def test_destination_search_and_filter():
    print("\n--- 2. Testing Destination Search & Filters ---")
    jaipur = get_destination_by_id("jaipur")
    assert jaipur is not None
    assert jaipur["destination"] == "Jaipur"
    print(f"[PASS] ID Lookup successful: {jaipur['destination']}, {jaipur['state']}")

    # Filter by region
    south_dests = search_and_filter_destinations(region="South", limit=50)
    assert south_dests["total"] > 0
    print(f"[PASS] Region Filter (South): {south_dests['total']} destinations found.")

    # Search query
    beach_search = search_and_filter_destinations(query="beach", limit=10)
    assert beach_search["total"] > 0
    print(f"[PASS] Text Search ('beach'): {beach_search['total']} results found.")


def test_vector_recommender():
    print("\n--- 3. Testing AI Vector Recommender ---")

    # Test 1: Nature & Adventure
    adventure_prefs = {
        "nature": 5.0,
        "adventure": 5.0,
        "history": 0.0,
        "beach": 0.0,
        "food": 2.0,
        "spirituality": 0.0,
        "relaxation": 3.0,
        "wildlife": 3.0,
        "culture": 1.0,
        "nightlife": 1.0
    }
    recs = get_recommendations(adventure_prefs, companion_type="Friends", top_n=3)
    assert len(recs) == 3
    print("[PASS] Top Adventure & Nature Matches:")
    for r in recs:
        print(f"   - {r['destination']} ({r['state']}) | Match: {r['match_score_percentage']}% | Why: {r['why_recommended']}")

    # Test 2: Heritage & Spirituality in North
    heritage_prefs = {
        "history": 5.0,
        "spirituality": 5.0,
        "culture": 5.0,
        "food": 4.0,
        "nature": 1.0,
        "adventure": 0.0,
        "beach": 0.0,
        "relaxation": 2.0,
        "wildlife": 0.0,
        "nightlife": 0.0
    }
    recs_heritage = get_recommendations(heritage_prefs, region="North", top_n=3)
    assert len(recs_heritage) == 3
    print("[PASS] Top Heritage & Spiritual Matches (North India):")
    for r in recs_heritage:
        print(f"   - {r['destination']} ({r['state']}) | Match: {r['match_score_percentage']}%")

    # Test 3: Similar Places Engine
    similar_to_manali = get_similar_destinations("manali", top_n=3)
    assert len(similar_to_manali) == 3
    print("[PASS] Similar Destinations Engine (Input: 'manali'):")
    for s in similar_to_manali:
        print(f"   - {s['destination']} ({s['category']}) | Match: {s['match_score_percentage']}%")


def test_itinerary_generator():
    print("\n--- 4. Testing AI Dynamic Itinerary Planner ---")
    itinerary = generate_itinerary(
        destination_id="munnar",
        days=3,
        pace="moderate",
        companion_type="Couple",
        budget_tier="moderate"
    )
    assert itinerary["status"] == "success"
    assert len(itinerary["daily_itinerary"]) == 3
    print(f"[PASS] Generated {itinerary['total_days']}-Day Itinerary for {itinerary['destination']} ({itinerary['state']}):")
    print(f"   - Total Cost: Rs. {itinerary['estimated_total_cost_inr']}")
    print(f"   - Day 1 Theme: {itinerary['daily_itinerary'][0]['theme']}")
    print(f"   - Morning: {itinerary['daily_itinerary'][0]['morning']['activity_title']}")
    print(f"   - Afternoon: {itinerary['daily_itinerary'][0]['afternoon']['activity_title']}")
    print(f"   - Evening: {itinerary['daily_itinerary'][0]['evening']['activity_title']}")
    print(f"   - Must Try Cuisine: {itinerary['daily_itinerary'][0]['meals']['must_try_dish']}")


def test_budget_estimator():
    print("\n--- 5. Testing Budget & Cost Estimator ---")
    budget = estimate_trip_budget(
        destination_id="goa",
        days=4,
        group_size=4,
        tier="moderate",
        travel_month="Dec"
    )
    assert budget["status"] == "success"
    print(f"[PASS] Budget Estimation for {budget['destination']} ({budget['days']} days, {budget['group_size']} persons, {budget['tier']} tier):")
    print(f"   - Total Cost: Rs. {budget['total_estimated_cost_inr']} (Rs. {budget['cost_per_person_inr']}/person)")
    print(f"   - Breakdown: Stay: Rs. {budget['breakdown']['accommodation_inr']}, Food: Rs. {budget['breakdown']['food_and_dining_inr']}, Transit: Rs. {budget['breakdown']['local_transport_inr']}")
    print(f"   - Season Factor: {budget['season_factor_applied']}")


def test_crowd_predictor():
    print("\n--- 6. Testing Seasonality & Crowd Predictor ---")
    crowd = predict_crowd_and_seasonality(destination_id="varanasi", query_month="Nov")
    assert crowd["status"] == "success"
    print(f"[PASS] Crowd & Weather Forecast for {crowd['destination']} in {crowd['query_month']}:")
    print(f"   - Crowd Level: {crowd['crowd_level']} (Index: {crowd['crowd_index']}/10)")
    print(f"   - Weather: {crowd['weather_condition']}")
    print(f"   - Suitability Score: {crowd['travel_suitability_score']}/10")
    print(f"   - Advisory: {crowd['overtourism_advisory']}")


if __name__ == "__main__":
    print("==================================================")
    print("      SIH TOURISM AI/ML TEST SUITE EXECUTION      ")
    print("==================================================")
    test_dataset_integrity()
    test_destination_search_and_filter()
    test_vector_recommender()
    test_itinerary_generator()
    test_budget_estimator()
    test_crowd_predictor()
    print("\n==================================================")
    print("   [SUCCESS] ALL 6 TEST MODULES PASSED!           ")
    print("==================================================")
