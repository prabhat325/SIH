import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.recommender import get_recommendations

user_preferences = {
    "nature": 2.0,
    "history": 5.0,
    "adventure": 1.0,
    "food": 5.0,
    "beach": 0.0,
    "culture": 5.0,
    "relaxation": 3.0,
    "wildlife": 1.0,
    "spirituality": 4.0,
    "nightlife": 2.0,
}

recommendations = get_recommendations(
    user_preferences=user_preferences,
    region="North",
    companion_type="Family",
    top_n=5
)

print("\nRecommended Destinations (Preferences: Culture + History + Food in North India):\n")

for index, rec in enumerate(recommendations, start=1):
    print(
        f"{index}. {rec['destination']} ({rec['state']}) - "
        f"Match: {rec['match_score_percentage']}% | "
        f"Budget: Level {rec['budget_level']} (Rs. {rec['avg_cost_per_day_inr']}/day)"
    )
    print(f"   Why: {rec['why_recommended']}")
    print(f"   Top Attractions: {', '.join(rec['top_attractions'][:4])}\n")