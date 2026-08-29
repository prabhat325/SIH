"""
Comprehensive Automated Test Suite for SIH Tourism AI/ML Architecture.

Validates:
1. Vector Space math (NumPy cosine similarity, zero vectors, validation)
2. Contextual ranking & Explainable AI (XAI) feature attribution
3. Item-to-item similarity recommendations
4. Geographic routing (Haversine & TSP nearest-neighbor)
5. Constraint-aware itinerary generation & regional food graph
6. ML Budget regression (training, inference, MAE/RMSE/R² metrics, fallback)
7. ML Crowd forecasting & weather climate comfort diagnostics
8. User feedback persistence & ML dataset extraction
9. Full FastAPI HTTP endpoint validation via TestClient
"""

import sys
from pathlib import Path
import unittest

# Ensure workspace root is in sys.path
workspace_root = str(Path(__file__).resolve().parents[1])
if workspace_root not in sys.path:
    sys.path.insert(0, workspace_root)

from fastapi.testclient import TestClient

from app.config.settings import settings
from app.main import app
from app.ml.budget_model import get_budget_model_metrics, predict_trip_cost, train_budget_model
from app.ml.crowd_model import get_crowd_model_metrics, predict_crowd_footfall, train_crowd_model
from app.ml.inference import warm_up_ml_models
from app.services.budget_service import estimate_trip_budget
from app.services.contextual_ranker import rank_destination
from app.services.crowd_service import predict_crowd_and_seasonality
from app.services.destination_service import get_destination_by_id, load_destinations
from app.services.feedback_service import export_training_dataset, get_interaction_stats, log_interaction
from app.services.itinerary_service import generate_itinerary
from app.services.recommender import get_recommendations
from app.services.routing import optimize_daily_attraction_route
from app.services.similarity import get_similar_destinations
from app.services.weather_service import get_weather_suitability
from app.utils.geo import haversine_distance_km, order_attractions_greedy_tsp
from app.utils.vector_ops import cosine_similarity, validate_and_normalize_vector


class TestVectorAndMath(unittest.TestCase):
    def test_cosine_similarity_identical(self):
        v1 = [5.0, 4.0, 3.0, 2.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        sim = cosine_similarity(v1, v1)
        self.assertAlmostEqual(sim, 1.0, places=4)

    def test_cosine_similarity_orthogonal(self):
        v1 = [5.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        v2 = [0.0, 5.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        sim = cosine_similarity(v1, v2)
        self.assertEqual(sim, 0.0)

    def test_cosine_similarity_zero_vector(self):
        v1 = [0.0] * 10
        v2 = [5.0, 4.0, 3.0, 2.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        sim = cosine_similarity(v1, v2)
        self.assertEqual(sim, 0.0)

    def test_vector_normalization_bounds(self):
        raw = [-2.0, 7.5, 3.0, float('nan'), 1.0, 2.0, 3.0, 4.0, 5.0, 6.0]
        normalized = validate_and_normalize_vector(raw, target_dim=10, clip_min=0.0, clip_max=5.0)
        self.assertEqual(normalized[0], 0.0)  # Clipped below min
        self.assertEqual(normalized[1], 5.0)  # Clipped above max
        self.assertEqual(normalized[3], 0.0)  # NaN converted to 0.0


class TestGeographicRouting(unittest.TestCase):
    def test_haversine_distance(self):
        # Jaipur (26.9124, 75.7873) to Delhi (28.6139, 77.2090) ~ 230-245 km
        dist = haversine_distance_km(26.9124, 75.7873, 28.6139, 77.2090)
        self.assertTrue(220 < dist < 260, f"Unexpected distance: {dist}")

    def test_attraction_sequencing(self):
        attractions = ["Hawa Mahal", "Amber Fort", "City Palace", "Nahargarh Fort"]
        routed = optimize_daily_attraction_route(attractions, 26.9124, 75.7873)
        self.assertEqual(len(routed), 4)
        self.assertEqual(routed[0]["transit_time_minutes"], 0)
        self.assertGreaterEqual(routed[1]["transit_time_minutes"], 10)


class TestRecommenderAndXAI(unittest.TestCase):
    def test_recommendations_with_xai(self):
        user_prefs = {"nature": 5.0, "adventure": 5.0, "history": 1.0}
        results = get_recommendations(
            user_preferences=user_prefs,
            companion_type="Friends",
            travel_month="Nov",
            top_n=3,
        )
        self.assertGreater(len(results), 0)
        top_pick = results[0]
        self.assertIn("xai", top_pick)
        self.assertIn("top_contributing_features", top_pick["xai"])
        self.assertIn("positive_factors", top_pick["xai"])
        self.assertGreaterEqual(top_pick["score"], 0.50)

    def test_item_similarity(self):
        similar = get_similar_destinations("manali", top_n=3)
        self.assertEqual(len(similar), 3)
        dest_ids = [d["destination_id"] for d in similar]
        self.assertNotIn("manali", dest_ids)  # Excludes itself


class TestMLModels(unittest.TestCase):
    def test_budget_ml_training_and_metrics(self):
        metrics = train_budget_model()
        self.assertIn("r2_score", metrics)
        self.assertIn("mae_inr", metrics)
        self.assertGreater(metrics["r2_score"], 0.70)

        dest = get_destination_by_id("jaipur")
        pred, low, high = predict_trip_cost(dest, days=3, group_size=2, budget_tier="moderate")
        self.assertGreater(pred, 0)
        self.assertLessEqual(low, pred)
        self.assertGreaterEqual(high, pred)

    def test_crowd_ml_training_and_metrics(self):
        metrics = train_crowd_model()
        self.assertIn("r2_score", metrics)
        self.assertIn("mae_index", metrics)

        dest = get_destination_by_id("manali")
        index, cat = predict_crowd_footfall(dest, month="Dec", is_peak_season=True, weather_score=8.5)
        self.assertTrue(1.0 <= index <= 10.0)
        self.assertIn(cat, ["Low", "Moderate", "High", "Peak / Very High"])


class TestItineraryAndBudgetServices(unittest.TestCase):
    def test_itinerary_generation(self):
        plan = generate_itinerary(destination_id="jaipur", days=3, pace="moderate")
        self.assertEqual(plan["total_days"], 3)
        self.assertEqual(len(plan["daily_itinerary"]), 3)
        day1 = plan["daily_itinerary"][0]
        self.assertIn("morning", day1)
        self.assertIn("afternoon", day1)
        self.assertIn("evening", day1)
        self.assertIn("meals", day1)

    def test_budget_service(self):
        budget_res = estimate_trip_budget(destination_id="goa", days=4, group_size=4, tier="moderate")
        self.assertIn("total_estimated_cost_inr", budget_res)
        self.assertIn("breakdown", budget_res)
        self.assertIn("estimator_used", budget_res)


class TestFeedbackService(unittest.TestCase):
    def test_feedback_logging_and_export(self):
        log_res = log_interaction(
            user_id="test_user_sih",
            destination_id="munnar",
            event_type="destination_liked",
            rating=5.0,
            context={"companion_type": "Family"},
        )
        self.assertEqual(log_res["status"], "success")

        stats = get_interaction_stats()
        self.assertGreaterEqual(stats["total_interactions_logged"], 1)

        dataset = export_training_dataset(limit=5)
        self.assertGreaterEqual(len(dataset), 1)
        self.assertEqual(dataset[0]["target_label"], 1)


class TestFastAPIEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_root_and_health(self):
        r = self.client.get("/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["status"], "online")

        r_health = self.client.get("/health")
        self.assertEqual(r_health.status_code, 200)
        self.assertGreaterEqual(r_health.json()["cached_destinations"], 240)

    def test_recommend_endpoint(self):
        payload = {
            "preferences": {"nature": 5.0, "adventure": 4.0},
            "top_n": 3,
        }
        r = self.client.post("/api/v1/recommend", json=payload)
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(len(data["results"]), 3)

    def test_budget_predict_endpoint(self):
        payload = {
            "destination_id": "jaipur",
            "days": 3,
            "group_size": 2,
            "tier": "moderate",
        }
        r = self.client.post("/api/v1/budget/predict", json=payload)
        self.assertEqual(r.status_code, 200)
        self.assertIn("total_estimated_cost_inr", r.json())

    def test_crowd_and_weather_endpoints(self):
        r_crowd = self.client.get("/api/v1/crowd/manali?month=Dec")
        self.assertEqual(r_crowd.status_code, 200)
        self.assertIn("crowd_level", r_crowd.json())

        r_weather = self.client.get("/api/v1/weather/manali?month=Dec")
        self.assertEqual(r_weather.status_code, 200)
        self.assertIn("suitability_score", r_weather.json())

    def test_ml_metrics_endpoint(self):
        r_metrics = self.client.get("/api/v1/ml/metrics")
        self.assertEqual(r_metrics.status_code, 200)
        self.assertIn("evaluations", r_metrics.json())


def run_tests():
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return result.wasSuccessful()


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
