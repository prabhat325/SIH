"""
Machine Learning Budget Estimator (Regression Model).

Trains a calibrated HistGradientBoosting/GradientBoosting regressor on simulated historical
Indian tourism trip expenses. Calculates genuine evaluation metrics (MAE, RMSE, R²).
"""

from typing import Dict, Optional, Tuple
import numpy as np
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score, root_mean_squared_error
from sklearn.model_selection import train_test_split

from app.config.settings import settings
from app.ml.features import extract_budget_features
from app.services.contextual_ranker import is_month_in_season
from app.services.destination_service import load_destinations


_BUDGET_MODEL: Optional[HistGradientBoostingRegressor] = None
_BUDGET_METRICS: Dict[str, float] = {}


def _generate_calibrated_training_data() -> Tuple[np.ndarray, np.ndarray]:
    """
    Generates domain-calibrated travel expense training data across 256 destinations,
    varying group sizes (1-8), durations (1-10 days), tiers (budget, moderate, luxury),
    and seasonal variations.
    """
    destinations = load_destinations()
    X_list = []
    y_list = []

    np.random.seed(42)
    tiers = ["budget", "moderate", "luxury"]
    months = ["Jan", "Apr", "Jul", "Oct", "Dec"]

    for dest in destinations:
        base_cost = float(dest.get("avg_cost_per_day_inr", 2500))
        best_m = dest.get("best_months", "")
        for days in [1, 2, 3, 4, 5, 7, 10]:
            for group_size in [1, 2, 4, 6, 8]:
                for tier in tiers:
                    for month in months:
                        is_peak = is_month_in_season(month, best_m)
                        feat = extract_budget_features(
                            dest, days, group_size, tier, month, is_peak
                        )

                        tier_mult = settings.TIER_MULTIPLIERS.get(tier, 1.0)
                        if group_size == 1:
                            g_disc = settings.GROUP_DISCOUNTS["solo"]
                        elif group_size == 2:
                            g_disc = settings.GROUP_DISCOUNTS["couple"]
                        elif 3 <= group_size <= 5:
                            g_disc = settings.GROUP_DISCOUNTS["small_group"]
                        else:
                            g_disc = settings.GROUP_DISCOUNTS["large_group"]

                        season_mult = (
                            settings.SEASON_SURGE_MULTIPLIER
                            if is_peak
                            else settings.OFF_PEAK_DISCOUNT_MULTIPLIER
                        )
                        noise = np.random.normal(1.0, 0.015)

                        true_cost = (
                            base_cost
                            * tier_mult
                            * days
                            * group_size
                            * g_disc
                            * season_mult
                            * noise
                        )

                        X_list.append(feat)
                        y_list.append(true_cost)

    return np.array(X_list, dtype=np.float64), np.array(y_list, dtype=np.float64)


def train_budget_model() -> Dict[str, float]:
    """
    Trains the HistGradientBoosting budget regressor and calculates real evaluation metrics.
    """
    global _BUDGET_MODEL, _BUDGET_METRICS

    X, y = _generate_calibrated_training_data()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    model = HistGradientBoostingRegressor(
        max_iter=100,
        learning_rate=0.10,
        max_depth=6,
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))

    _BUDGET_MODEL = model
    _BUDGET_METRICS = {
        "mae_inr": round(mae, 2),
        "rmse_inr": round(rmse, 2),
        "r2_score": round(r2, 4),
        "sample_count": len(X),
        "test_sample_count": len(X_test),
    }

    return _BUDGET_METRICS


def get_budget_model_metrics() -> Dict[str, float]:
    """Returns the evaluation metrics of the trained ML budget regressor."""
    global _BUDGET_MODEL, _BUDGET_METRICS
    if _BUDGET_MODEL is None:
        train_budget_model()
    return _BUDGET_METRICS


def predict_trip_cost(
    destination: Dict,
    days: int,
    group_size: int,
    budget_tier: str = "moderate",
    travel_month: Optional[str] = "Nov",
    is_peak_season: bool = False,
) -> Tuple[int, int, int]:
    """
    Infers trip cost using the trained ML model.
    Returns: (predicted_cost, expected_range_low, expected_range_high)
    """
    global _BUDGET_MODEL
    if _BUDGET_MODEL is None:
        train_budget_model()

    feat = extract_budget_features(
        destination, days, group_size, budget_tier, travel_month, is_peak_season
    )
    X = feat.reshape(1, -1)
    pred = float(_BUDGET_MODEL.predict(X)[0])
    pred_int = int(round(pred))

    mae = _BUDGET_METRICS.get("mae_inr", 650.0)
    range_low = max(500, int(pred_int - (mae * 1.25)))
    range_high = int(pred_int + (mae * 1.25))

    return pred_int, range_low, range_high
