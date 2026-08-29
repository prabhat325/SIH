"""
Live Swagger API Requests & Verification Script.
Executes diverse real-world travel planning requests directly against the live
FastAPI server on http://localhost:8000 and displays formatted verification logs.
"""

import json
import urllib.request


def make_request(method, url, payload=None):
    if method == "POST":
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )
    else:
        req = urllib.request.Request(url)

    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def run_live_scenario_tests():
    print("\n" + "=" * 70)
    print("       LIVE SWAGGER DOCS REQUESTS & VERIFICATION TEST SUITE       ")
    print("=" * 70)

    # -------------------------------------------------------------------------
    # Scenario 1: Spiritual & Heritage Family Trip
    # -------------------------------------------------------------------------
    print("\n[REQUEST 1] POST /api/v1/recommend (Spiritual & Heritage Family Trip in North India)")
    payload1 = {
        "preferences": {
            "spirituality": 5.0,
            "history": 4.0,
            "culture": 5.0,
            "nature": 2.0,
            "food": 4.0,
        },
        "companion_type": "Family",
        "region": "North",
        "travel_month": "Nov",
        "budget_level": 2,
        "top_n": 3,
    }
    res1 = make_request("POST", "http://localhost:8000/api/v1/recommend", payload1)
    print(f"Status: {res1['status']} | Results returned: {res1['total_results']}")
    for idx, r in enumerate(res1["results"], 1):
        print(f"  {idx}. {r['destination']} ({r['state']}) | Match: {r['match_percentage']}% | Budget: Tier {r['budget_level']}")
        print(f"     XAI Summary: {r['why_recommended']}")
        print(f"     Top Drivers: {[f['feature'] for f in r['xai']['top_contributing_features'][:2]]}")
        print(f"     Positive Checkmarks: {r['xai']['positive_factors']}")

    # -------------------------------------------------------------------------
    # Scenario 2: Adventure & Nature Trip with Friends
    # -------------------------------------------------------------------------
    print("\n[REQUEST 2] POST /api/v1/recommend (Adventure & Nature Friends Trip in South India)")
    payload2 = {
        "preferences": {
            "nature": 5.0,
            "adventure": 5.0,
            "relaxation": 3.0,
        },
        "companion_type": "Friends",
        "region": "South",
        "travel_month": "Oct",
        "top_n": 3,
    }
    res2 = make_request("POST", "http://localhost:8000/api/v1/recommend", payload2)
    for idx, r in enumerate(res2["results"], 1):
        print(f"  {idx}. {r['destination']} ({r['state']}) | Match: {r['match_percentage']}% | Best Months: {r['best_months']}")
        print(f"     Top Attractions: {r['top_attractions'][:3]}")

    # -------------------------------------------------------------------------
    # Scenario 3: Item-to-Item Similarity (Find alternatives to Kasol)
    # -------------------------------------------------------------------------
    print("\n[REQUEST 3] POST /api/v1/recommend/similar (Finding vibe-matched alternatives to 'kasol')")
    payload3 = {"destination_id": "kasol", "top_n": 3}
    res3 = make_request("POST", "http://localhost:8000/api/v1/recommend/similar", payload3)
    for idx, s in enumerate(res3["results"], 1):
        print(f"  {idx}. {s['destination']} ({s['state']}) [{s['category']}] | Similarity: {s['match_percentage']}%")

    # -------------------------------------------------------------------------
    # Scenario 4: 3-Day Route-Optimized Itinerary for Munnar
    # -------------------------------------------------------------------------
    print("\n[REQUEST 4] POST /api/v1/itinerary/generate (3-Day Moderate Trip for Munnar, Kerala)")
    payload4 = {
        "destination_id": "munnar",
        "days": 3,
        "pace": "moderate",
        "companion_type": "Couple",
        "budget_tier": "moderate",
    }
    res4 = make_request("POST", "http://localhost:8000/api/v1/itinerary/generate", payload4)
    print(f"Destination: {res4['destination']} | Total Days: {res4['total_days']} | Total Estimated Cost: INR {res4['estimated_total_cost_inr']}")
    for d in res4["daily_itinerary"]:
        print(f"  -> Day {d['day']} ({d['theme']}):")
        print(f"     Morning:   {d['morning']['attraction_name']} ({d['morning']['time']})")
        print(f"     Afternoon: {d['afternoon']['attraction_name']} ({d['afternoon']['time']}) [Transit: {d['afternoon']['estimated_transit_mins']} mins]")
        print(f"     Evening:   {d['evening']['attraction_name']} ({d['evening']['time']}) [Transit: {d['evening']['estimated_transit_mins']} mins]")
        print(f"     Regional Meal Highlight: {d['meals']['lunch']}")

    # -------------------------------------------------------------------------
    # Scenario 5: Machine Learning Budget Prediction
    # -------------------------------------------------------------------------
    print("\n[REQUEST 5] POST /api/v1/budget/predict (ML Budget for 2 people in Shimla for 5 days, Luxury tier in Dec)")
    payload5 = {
        "destination_id": "shimla",
        "days": 5,
        "group_size": 2,
        "tier": "luxury",
        "travel_month": "Dec",
    }
    res5 = make_request("POST", "http://localhost:8000/api/v1/budget/predict", payload5)
    print(f"Estimator Used: {res5['estimator_used']}")
    print(f"Total Cost: INR {res5['total_estimated_cost_inr']} (INR {res5['cost_per_person_inr']} per person)")
    print(f"Confidence Bounds: INR {res5['budget_range_min_inr']} - INR {res5['budget_range_max_inr']}")
    print(f"Itemized Breakdown: {res5['itemized_breakdown']}")
    print(f"Season Surge Applied: {res5['season_factor_applied']}")

    # -------------------------------------------------------------------------
    # Scenario 6: Overtourism & Crowd Diagnostics (Goa in Peak Dec vs Off-peak Jul)
    # -------------------------------------------------------------------------
    print("\n[REQUEST 6] GET /api/v1/crowd/forecast (Comparing North Goa: Peak December vs Monsoon July)")
    c_dec = make_request("GET", "http://localhost:8000/api/v1/crowd/forecast?destination_id=north_goa&month=Dec")
    c_jul = make_request("GET", "http://localhost:8000/api/v1/crowd/forecast?destination_id=north_goa&month=Jul")

    print(f"  * December (Peak): Crowd Level = '{c_dec['current_month_forecast']['crowd_level']}' | Footfall Index = {c_dec['current_month_forecast']['footfall_index']}/10 | Weather = {c_dec['current_month_forecast']['weather_suitability_score']}/10")
    print(f"    Advisory: {c_dec['current_month_forecast']['advisory']}")
    print(f"  * July (Monsoon):  Crowd Level = '{c_jul['current_month_forecast']['crowd_level']}' | Footfall Index = {c_jul['current_month_forecast']['footfall_index']}/10 | Weather = {c_jul['current_month_forecast']['weather_suitability_score']}/10")
    print(f"    Overtourism Recommendation: Best month is {c_dec['overtourism_mitigation']['best_month']} (Recommended Shoulder: {c_dec['overtourism_mitigation']['recommended_shoulder_month']})")

    # -------------------------------------------------------------------------
    # Scenario 7: User Feedback Logging & Pipeline Status
    # -------------------------------------------------------------------------
    print("\n[REQUEST 7] POST /api/v1/feedback & GET /api/v1/feedback/stats (Testing ML Feedback Loop)")
    fb_payload = {
        "user_id": "sih_evaluator_live_test",
        "destination_id": "munnar",
        "event_type": "destination_saved",
        "rating": 5.0,
        "context": {"companion_type": "Couple", "travel_month": "Nov", "budget_tier": "moderate"},
    }
    fb_res = make_request("POST", "http://localhost:8000/api/v1/feedback", fb_payload)
    print(f"Feedback Logged: Interaction ID = {fb_res['interaction_id']} | User = {fb_res['user_id']} | Event = {fb_res['event_type']}")

    stats_res = make_request("GET", "http://localhost:8000/api/v1/feedback/stats")
    print(f"Feedback DB Stats: Total Interactions = {stats_res['total_interactions_logged']} | Events Breakdown = {stats_res['events_breakdown']}")

    # -------------------------------------------------------------------------
    # Scenario 8: ML Model Validation Metrics for Judges
    # -------------------------------------------------------------------------
    print("\n[REQUEST 8] GET /api/v1/ml/metrics (Live Evaluation Scores for SIH Judges)")
    metrics_res = make_request("GET", "http://localhost:8000/api/v1/ml/metrics")
    b_eval = metrics_res["evaluations"]["budget_regression_metrics"]
    c_eval = metrics_res["evaluations"]["crowd_forecasting_metrics"]
    print(f"Budget Model:  R² Score = {b_eval['r2_score']} | MAE = INR {b_eval['mae_inr']} | Samples = {b_eval['sample_count']}")
    print(f"Crowd Model:   R² Score = {c_eval['r2_score']} | MAE = {c_eval['mae_index']} index pts | Samples = {c_eval['sample_count']}")

    print("\n" + "=" * 70)
    print("   [ALL 8 SCENARIOS VERIFIED SUCCESSFULLY ON LIVE SERVER (HTTP 200)]   ")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    run_live_scenario_tests()
