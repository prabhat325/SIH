"""
Live Demonstration Script for SIH Tourism AI/ML Microservice.
Connects directly to the live server on http://localhost:8000 and tests all endpoints.
"""

import json
import urllib.request


def post(url, data):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def get(url):
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    print("==================================================")
    print("      SIH TOURISM AI/ML LIVE DEMO EXECUTION       ")
    print("==================================================")

    # 1. Recommendation + XAI
    print("\n--- 1. Multi-Criteria AI Recommendation + XAI ---")
    rec = post(
        "http://localhost:8000/api/v1/recommend",
        {
            "preferences": {"nature": 5.0, "adventure": 5.0, "relaxation": 4.0},
            "companion_type": "Friends",
            "travel_month": "Nov",
            "budget_level": 2,
            "top_n": 2,
        },
    )
    for r in rec["results"]:
        print(f"-> {r['destination']} ({r['state']}) | Match: {r['match_percentage']}% | Score: {r['score']}")
        print(f"   Why: {r['why_recommended']}")
        print(f"   Positive Factors: {r['xai']['positive_factors']}")
        if r['xai']['cautions']:
            print(f"   Cautions: {r['xai']['cautions']}")

    # 2. Similar Places
    print("\n--- 2. Content-Based Item-to-Item Similarity ---")
    sim = post(
        "http://localhost:8000/api/v1/recommend/similar",
        {"destination_id": "manali", "top_n": 3},
    )
    for s in sim["results"]:
        print(f"-> {s['destination']} ({s['category']}) | Match: {s['match_percentage']}%")

    # 3. Route-Optimized Itinerary
    print("\n--- 3. Route-Optimized Constraint-Aware Itinerary ---")
    itin = post(
        "http://localhost:8000/api/v1/itinerary/generate",
        {"destination_id": "jaipur", "days": 2, "pace": "moderate"},
    )
    print(f"Destination: {itin['destination']} | Estimated 2-Day Cost: INR {itin['estimated_total_cost_inr']}")
    for d in itin["daily_itinerary"]:
        print(f"-> Day {d['day']} ({d['theme']}):")
        print(f"   Morning:   {d['morning']['attraction_name']} ({d['morning']['time']})")
        print(f"   Afternoon: {d['afternoon']['attraction_name']} ({d['afternoon']['time']}) - Transit: {d['afternoon']['estimated_transit_mins']} mins")
        print(f"   Evening:   {d['evening']['attraction_name']} ({d['evening']['time']}) - Transit: {d['evening']['estimated_transit_mins']} mins")
        print(f"   Cuisine:   Lunch -> {d['meals']['lunch']}")

    # 4. ML Budget Prediction
    print("\n--- 4. Machine Learning Budget Regressor ---")
    bgt = post(
        "http://localhost:8000/api/v1/budget/predict",
        {
            "destination_id": "goa",
            "days": 4,
            "group_size": 4,
            "tier": "moderate",
            "travel_month": "Dec",
        },
    )
    print(f"Model Used: {bgt['estimator_used']}")
    print(f"Total Predicted Cost: INR {bgt['total_estimated_cost_inr']} (INR {bgt['cost_per_person_inr']}/person)")
    print(f"Uncertainty Range: INR {bgt['budget_range_min_inr']} - INR {bgt['budget_range_max_inr']}")
    print(f"Breakdown: Stay: INR {bgt['itemized_breakdown']['accommodation_and_stay']}, Food: INR {bgt['itemized_breakdown']['food_and_dining']}, Transit: INR {bgt['itemized_breakdown']['local_transport_and_cabs']}")

    # 5. Crowd & Weather
    print("\n--- 5. ML Crowd & Weather Diagnostics ---")
    crd = get("http://localhost:8000/api/v1/crowd/manali?month=Nov")
    f_cast = crd["current_month_forecast"]
    print(f"Destination: Manali | Month: Nov")
    print(f"Crowd Level: {f_cast['crowd_level']} (Footfall Index: {f_cast['footfall_index']}/10)")
    print(f"Weather Condition: {f_cast['weather_condition']} ({f_cast['temperature_range']})")
    print(f"Climate Suitability: {f_cast['weather_suitability_score']}/10 | Overall Score: {f_cast['overall_suitability_score']}/10")
    print(f"Overtourism Recommendation: Best month is {crd['overtourism_mitigation']['best_month']} (Recommended Shoulder: {crd['overtourism_mitigation']['recommended_shoulder_month']})")

    # 6. ML Evaluation Metrics
    print("\n--- 6. Live ML Model Evaluation Metrics (For SIH Judges) ---")
    met = get("http://localhost:8000/api/v1/ml/metrics")
    b_met = met["evaluations"]["budget_regression_metrics"]
    c_met = met["evaluations"]["crowd_forecasting_metrics"]
    print(f"Budget Regressor: R2 Score = {b_met['r2_score']}, MAE = INR {b_met['mae_inr']}, Samples = {b_met['sample_count']}")
    print(f"Crowd Forecaster: R2 Score = {c_met['r2_score']}, MAE = {c_met['mae_index']} index pts, Samples = {c_met['sample_count']}")

    print("\n==================================================")
    print("   [SUCCESS] ALL LIVE DEMO ENDPOINTS VERIFIED!    ")
    print("==================================================")


if __name__ == "__main__":
    main()
