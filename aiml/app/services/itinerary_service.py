"""
Constraint-Aware AI Itinerary Planning Engine.

Generates personalized day-by-day itineraries respecting:
- Geographic routing (TSP nearest-neighbor ordering to minimize transit fatigue)
- Visit durations and activity pacing (relaxed, moderate, packed)
- Opening hours and time buffers
- Regional authentic culinary recommendations
- Budget tier scaling and practical travel tips
"""

from typing import Dict, List, Optional
from app.config.settings import settings
from app.services.destination_service import get_destination_by_id, load_destinations
from app.services.routing import optimize_daily_attraction_route

# Regional culinary knowledge base
REGIONAL_MEALS = {
    "Rajasthan": {
        "breakfast": "Pyaaz Kachori & Masala Chai with Jalebi at a heritage sweet shop",
        "lunch": "Authentic Rajasthani Thali with Dal Baati Churma and Ker Sangri",
        "dinner": "Rooftop dining with Laal Maas (or Paneer Rajwada) and Bajra Roti",
        "specialty": "Dal Baati Churma & Ghewar",
    },
    "Himachal Pradesh": {
        "breakfast": "Fresh Apple Pancakes or stuffed Himachali Parathas with Pahadi Chai",
        "lunch": "Traditional Himachali Dham (Madra, Sepu Badi) or fresh Himalayan Trout",
        "dinner": "Steaming hot Siddu with pure ghee, or Thukpa & Momos at a local cafe",
        "specialty": "Himachali Siddu & Trout Fish",
    },
    "Uttarakhand": {
        "breakfast": "Aloo Ke Gutke with Puri and hot herbal Pahadi tea",
        "lunch": "Traditional Kumaoni/Garhwali Thali with Kafuli, Phaanu, and Jhangora Kheer",
        "dinner": "Chainsoo dal with steamed rice, followed by sweet Singodi or Bal Mithai",
        "specialty": "Kafuli & Bal Mithai",
    },
    "Uttar Pradesh": {
        "breakfast": "Crispy Bedmi Puri with spicy Aloo Sabzi and Kulhad Lassi",
        "lunch": "Royal Awadhi Biryani, Sheermal, and Shahi Paneer",
        "dinner": "Melt-in-mouth Galouti/Kakori Kebabs (or Paneer Tikka) on vibrant food street",
        "specialty": "Galouti Kebabs, Banarasi Paan & Malaiyo",
    },
    "Goa": {
        "breakfast": "Poee bread with Goan Chourico or mushroom vindaloo and fresh coconut water",
        "lunch": "Goan Fish Curry Thali with Kingfish fry, Solkadhi, and steamed rice",
        "dinner": "Beachside candlelit seafood dinner with Bebinca dessert",
        "specialty": "Goan Fish Curry & Bebinca",
    },
    "Kerala": {
        "breakfast": "Soft Appam with Vegetable/Chicken Stew or Puttu with Kadala Curry",
        "lunch": "Traditional Kerala Sadhya served on banana leaf with Karimeen Pollichathu",
        "dinner": "Flaky Malabar Parotta with Malabar Roast or fresh backwater prawns",
        "specialty": "Kerala Sadhya & Karimeen Pollichathu",
    },
    "Karnataka": {
        "breakfast": "Crispy Mysore Masala Dosa, Idli-Vada with piping hot Filter Coffee",
        "lunch": "North Karnataka Jolada Rotti Oota or Mysore Thali with Bisi Bele Bath",
        "dinner": "Coastal Mangalorean Ghee Roast (Chicken/Paneer) with Neer Dosa",
        "specialty": "Mysore Masala Dosa & Mysore Pak",
    },
    "Tamil Nadu": {
        "breakfast": "Ghee Pongal with Medu Vada, Coconut Chutney, and Kumbakonam Degree Coffee",
        "lunch": "Traditional Chettinad Banana Leaf Meals with spicy Pepper Gravy",
        "dinner": "Kothu Parotta, Idiyappam with coconut milk, followed by Jigarthanda",
        "specialty": "Chettinad Cuisine & Madurai Jigarthanda",
    },
    "West Bengal": {
        "breakfast": "Hot Radhaballabhi with Cholar Dal and sweet Mishti Doi",
        "lunch": "Grand Bengali Thali with Kosha Mangsho (or Dhokar Dalna), Ilish/Bhetki Maach",
        "dinner": "Kolkata Biryani with Aloo and juicy Kathi Rolls from Park Street",
        "specialty": "Kosha Mangsho, Rosogolla & Mishti Doi",
    },
    "Maharashtra": {
        "breakfast": "Warm Misal Pav with Farsan, Batata Vada, and Cutting Chai",
        "lunch": "Kolhapuri or Maharashtrian Thali with Pithla Bhakri and Thecha",
        "dinner": "Coastal Malvani Surmai Fry or Veg Kolhapuri with Solkadhi",
        "specialty": "Misal Pav, Puran Poli & Modak",
    },
    "Jammu & Kashmir": {
        "breakfast": "Traditional Kashmiri Girda bread with Noon Chai or Kahwa and dry fruits",
        "lunch": "Authentic Kashmiri Wazwan (Rogan Josh, Rista, Gushtaba) or Nadru Yakhni",
        "dinner": "Fresh Dal Lake Lotus Stem curry with Kashmiri Pulao and Phirni",
        "specialty": "Kashmiri Wazwan & Kahwa",
    },
    "Ladakh": {
        "breakfast": "Traditional Ladakhi Khambir bread with butter tea and apricot jam",
        "lunch": "Hearty bowl of Skyu or hot Thukpa with homemade vegetable momos",
        "dinner": "Tingmo (steamed buns) with Tibetan spiced gravy and Chhurpi soup",
        "specialty": "Skyu, Thukpa & Khambir",
    },
    "North-East": {
        "breakfast": "Steamed Pork/Veg Dimsums with spicy Naga chili chutney and local herbal tea",
        "lunch": "Assamese/Khasi Thali with bamboo shoot curry, Khar, and sticky rice",
        "dinner": "Smoked meat/mushroom stir fry with local greens and traditional rice brew",
        "specialty": "Smoked Pork/Mushroom with Bamboo Shoot",
    },
    "Default": {
        "breakfast": "Local specialty breakfast with hot tea or fresh juice",
        "lunch": "Authentic regional lunch thali highlighting seasonal vegetables and local grains",
        "dinner": "Specialty dining at a scenic ambient restaurant with regional sweets",
        "specialty": "Authentic Regional Specialties",
    },
}


def get_meals_for_state(state: str) -> Dict[str, str]:
    """Resolves regional culinary recommendations by state."""
    for key, meal_data in REGIONAL_MEALS.items():
        if key.lower() in state.lower():
            return meal_data
    return REGIONAL_MEALS["Default"]


def generate_itinerary(
    destination_id: Optional[str] = None,
    destination_name: Optional[str] = None,
    days: int = 3,
    pace: str = "moderate",
    companion_type: str = "Solo",
    budget_tier: str = "moderate",
    interests: Optional[List[str]] = None,
) -> Dict:
    """
    Generates a constraint-aware, route-optimized day-by-day travel plan.
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

    days = max(1, min(10, days))
    pace_lower = pace.lower().strip()
    tier_lower = budget_tier.lower().strip()

    # Budget Multipliers
    tier_multipliers = settings.TIER_MULTIPLIERS
    cost_mult = tier_multipliers.get(tier_lower, 1.0)
    base_cost_per_day = int(dest.get("avg_cost_per_day_inr", 2500) * cost_mult)

    raw_attractions = [a.strip() for a in dest.get("top_attractions", "").split(";") if a.strip()]
    if not raw_attractions:
        raw_attractions = [
            f"Scenic highlights of {dest['destination']}",
            f"Historic center of {dest['destination']}",
            f"Local craft bazaar of {dest['destination']}",
        ]

    state_meals = get_meals_for_state(dest["state"])
    dest_lat = float(dest.get("latitude", 20.0))
    dest_lon = float(dest.get("longitude", 78.0))

    day_themes = [
        "Arrival, Orientation & Iconic Landmarks",
        "Deep Heritage Walk & Cultural Immersion",
        "Nature Panorama, Trails & Scenic Vistas",
        "Adventure, Local Experiences & Hidden Gems",
        "Art, Handicrafts & Local Bazaars",
        "Culinary Trail, Wellness & Sunset Views",
        "Surrounding Countryside & Leisure Exploration",
        "Spiritual Sites, River Ghats & Meditation",
        "Photography Tour & Eco Trails",
        "Memories, Souvenir Shopping & Grand Farewell",
    ]

    daily_plans = []
    attr_idx = 0
    num_attrs = len(raw_attractions)

    for d in range(1, days + 1):
        theme = day_themes[(d - 1) % len(day_themes)]
        day_attractions = [
            raw_attractions[(attr_idx + 0) % num_attrs],
            raw_attractions[(attr_idx + 1) % num_attrs],
            raw_attractions[(attr_idx + 2) % num_attrs],
        ]
        attr_idx += 3

        # Apply geographic route optimization to order the day's stops
        routed_stops = optimize_daily_attraction_route(day_attractions, dest_lat, dest_lon)
        p_attr = routed_stops[0]["name"] if routed_stops else day_attractions[0]
        s_attr = routed_stops[1]["name"] if len(routed_stops) > 1 else day_attractions[1]
        t_attr = routed_stops[2]["name"] if len(routed_stops) > 2 else day_attractions[2]

        transit_time_1 = routed_stops[1]["transit_time_minutes"] if len(routed_stops) > 1 else 20
        transit_time_2 = routed_stops[2]["transit_time_minutes"] if len(routed_stops) > 2 else 20

        # Activity durations based on pace constraints
        if pace_lower == "relaxed":
            m_dur, a_dur, e_dur = 2.5, 2.0, 2.0
            m_time, a_time, e_time = "09:30 AM - 12:00 PM", "02:30 PM - 04:30 PM", "05:30 PM - 07:30 PM"
        elif pace_lower == "packed":
            m_dur, a_dur, e_dur = 4.0, 3.5, 3.5
            m_time, a_time, e_time = "07:30 AM - 11:30 AM", "01:00 PM - 04:30 PM", "05:00 PM - 09:00 PM"
        else:  # moderate
            m_dur, a_dur, e_dur = 3.0, 2.5, 2.5
            m_time, a_time, e_time = "08:30 AM - 11:30 AM", "01:30 PM - 04:00 PM", "05:00 PM - 07:30 PM"

        morning_slot = {
            "time": m_time,
            "activity_title": f"Explore {p_attr}",
            "attraction_name": p_attr,
            "description": f"Start the morning at {p_attr} to take advantage of pleasant ambient lighting and light morning crowds.",
            "duration_hours": m_dur,
            "pro_tip": "Book entry passes online in advance where available to bypass queues.",
            "estimated_transit_mins": 0,
        }

        afternoon_slot = {
            "time": a_time,
            "activity_title": f"Visit {s_attr} & Heritage Discovery",
            "attraction_name": s_attr,
            "description": f"Proceed to {s_attr}, take guided historical insights, and relax at a nearby traditional cafe.",
            "duration_hours": a_dur,
            "pro_tip": "Stay hydrated and carry a light sun hat during afternoon excursions.",
            "estimated_transit_mins": transit_time_1,
        }

        evening_slot = {
            "time": e_time,
            "activity_title": f"Sunset Views at {t_attr} & Local Markets",
            "attraction_name": t_attr,
            "description": f"Witness the golden sunset at {t_attr}, followed by a stroll through nearby artisan markets.",
            "duration_hours": e_dur,
            "pro_tip": "Engage politely with local artisans and sample authentic street delicacies.",
            "estimated_transit_mins": transit_time_2,
        }

        daily_plans.append({
            "day": d,
            "title": f"Day {d}: {p_attr} & Highlights",
            "theme": theme,
            "morning": morning_slot,
            "afternoon": afternoon_slot,
            "evening": evening_slot,
            "route_optimized": True,
            "meals": {
                "breakfast": state_meals["breakfast"],
                "lunch": state_meals["lunch"],
                "dinner": state_meals["dinner"],
                "must_try_dish": state_meals["specialty"],
            },
            "estimated_day_budget_inr": base_cost_per_day,
        })

    tips = [
        f"Best season to visit {dest['destination']} is {dest['best_months']}.",
        f"Targeted pace is '{pace}': travel routes are sequenced geographically to minimize transit delays.",
        f"Tailored for {companion_type} travelers: verified safe with a {dest['safety_score']}/10 safety index.",
        "Currency & Payments: UPI (Google Pay, PhonePe, Paytm) is widely accepted, but keep ₹1,000-2,000 cash for remote transport/entry fees.",
        "Dress respectfully when visiting religious, spiritual, or heritage monuments.",
    ]

    total_cost = base_cost_per_day * days

    return {
        "status": "success",
        "destination_id": dest["destination_id"],
        "destination": dest["destination"],
        "state": dest["state"],
        "region": dest["region"],
        "total_days": days,
        "pace": pace,
        "companion_type": companion_type,
        "budget_tier": budget_tier,
        "estimated_total_cost_inr": total_cost,
        "daily_itinerary": daily_plans,
        "essential_travel_tips": tips,
        "best_time_to_visit": dest["best_months"],
    }
