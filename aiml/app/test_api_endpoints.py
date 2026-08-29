import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_api():
    print("==================================================")
    print("       FASTAPI REST ENDPOINTS INTEGRATION TEST     ")
    print("==================================================")

    # 1. Root & Health
    r_root = client.get("/")
    assert r_root.status_code == 200, f"Root failed: {r_root.text}"
    print("[PASS] GET / -> HTTP 200 (Online)")

    r_health = client.get("/health")
    assert r_health.status_code == 200, f"Health failed: {r_health.text}"
    data_health = r_health.json()
    print(f"[PASS] GET /health -> Cached Destinations: {data_health['cached_destinations']}")

    # 2. Destinations List & Detail
    r_dests = client.get("/api/v1/destinations?region=North&limit=5")
    assert r_dests.status_code == 200
    data_dests = r_dests.json()
    print(f"[PASS] GET /api/v1/destinations -> Total North: {data_dests['total']}, Page: {len(data_dests['destinations'])}")

    r_detail = client.get("/api/v1/destinations/jaipur")
    assert r_detail.status_code == 200
    detail = r_detail.json()
    print(f"[PASS] GET /api/v1/destinations/jaipur -> {detail['destination']} ({detail['state']})")

    # 3. Recommendations Endpoint
    rec_payload = {
        "preferences": {
            "nature": 4.5,
            "adventure": 4.0,
            "food": 3.0,
            "relaxation": 3.5,
            "beach": 0.0,
            "history": 1.0,
            "culture": 2.0,
            "wildlife": 2.0,
            "spirituality": 1.0,
            "nightlife": 2.0
        },
        "region": "North",
        "companion_type": "Friends",
        "top_n": 3
    }
    r_rec = client.post("/api/v1/recommend", json=rec_payload)
    assert r_rec.status_code == 200
    recs = r_rec.json()
    print(f"[PASS] POST /api/v1/recommend -> {recs['total_results']} recommended destinations returned.")
    for res in recs["results"]:
        print(f"       - {res['destination']} ({res['state']}) [{res['category']}] - Match: {res['match_score_percentage']}%")

    # 4. Similar Places Endpoint
    r_sim = client.post("/api/v1/recommend/similar", json={"destination_id": "goa", "top_n": 3})
    assert r_sim.status_code == 200
    sims = r_sim.json()
    print(f"[PASS] POST /api/v1/recommend/similar -> Found {sims['total_similar_found']} alternatives to 'goa'.")

    # 5. Itinerary Endpoint
    itin_payload = {
        "destination_id": "jaipur",
        "days": 3,
        "pace": "moderate",
        "companion_type": "Family",
        "budget_tier": "moderate"
    }
    r_itin = client.post("/api/v1/itinerary/generate", json=itin_payload)
    assert r_itin.status_code == 200
    itin = r_itin.json()
    print(f"[PASS] POST /api/v1/itinerary/generate -> {itin['total_days']}-day plan generated for {itin['destination']}.")

    # 6. Budget Endpoint
    budget_payload = {
        "destination_id": "udaipur",
        "days": 3,
        "group_size": 2,
        "tier": "luxury",
        "travel_month": "Dec"
    }
    r_budget = client.post("/api/v1/budget/estimate", json=budget_payload)
    assert r_budget.status_code == 200
    b_data = r_budget.json()
    print(f"[PASS] POST /api/v1/budget/estimate -> Estimated: Rs. {b_data['total_estimated_cost_inr']} (Rs. {b_data['cost_per_person_inr']}/person)")

    # 7. Crowd Endpoint
    r_crowd = client.get("/api/v1/crowd/manali?month=Jan")
    assert r_crowd.status_code == 200
    crowd_data = r_crowd.json()
    print(f"[PASS] GET /api/v1/crowd/manali?month=Jan -> Crowd: {crowd_data['crowd_level']}, Weather: {crowd_data['weather_condition']}")

    print("\n==================================================")
    print("   [SUCCESS] ALL REST API ENDPOINTS VALIDATED!    ")
    print("==================================================")


if __name__ == "__main__":
    test_api()
