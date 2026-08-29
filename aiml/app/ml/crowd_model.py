"""
Machine Learning Tourist Crowd & Footfall Forecasting Model.

Trains a GradientBoosting/RandomForest model to predict tourist crowd intensity
indices (0.0 to 10.0) based on seasonal calendars, weather, popularity, and festivals.
"""

from typing import Dict, Optional, Tuple
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score, root_mean_squared_error
from sklearn.model_selection import train_test_split

from app.config.settings import settings
from app.ml.features import extract_crowd_features
from app.services.destination_service import load_destinations


_CROWD_MODEL: Optional[GradientBoostingRegressor] = None
_CROWD_METRICS: Dict[str, float] = {}
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _generate_calibrated_crowd_data() -> Tuple[np.ndarray, np.ndarray]:
    """
    Generates domain-calibrated footfall training data across 256 destinations for all 12 months.
    """
    destinations = load_destinations()
    X_list = []
    y_list = []
    np.random.seed(42)

    for dest in destinations:
        pop = float(dest.get("popularity_score", 8.0))
        best_months = dest.get("best_months", "").lower()
        category = dest.get("category", "")
        region = dest.get("region", "")

        for m in MONTHS:
            in_season = m.lower() in best_months or "year-round" in best_months
            # Simulated weather score
            w_score = 9.0 if in_season else (5.5 if m in ["Jul", "Aug"] else 7.0)

            feat = extract_crowd_features(dest, m, in_season, w_score)

            # Footfall target equation with seasonal dynamics
            if in_season:
                if m in ["Dec", "Jan", "May", "Oct", "Nov"]:
                    base_footfall = min(10.0, pop * 1.05)
                else:
                    base_footfall = pop * 0.90
            else:
                if m in ["Jul", "Aug"] and category != "Wildlife":
                    base_footfall = max(1.5, pop * 0.35)
                elif m in ["May", "Jun"] and region in ["North", "Central"] and category != "Hill Station":
                    base_footfall = max(2.0, pop * 0.40)
                else:
                    base_footfall = pop * 0.60

            noise = np.random.normal(0.0, 0.25)
            target = float(np.clip(base_footfall + noise, 1.0, 10.0))

            X_list.append(feat)
            y_list.append(target)

    return np.array(X_list, dtype=np.float64), np.array(y_list, dtype=np.float64)


def train_crowd_model() -> Dict[str, float]:
    """
    Trains the GradientBoosting crowd predictor and calculates validation metrics.
    """
    global _CROWD_MODEL, _CROWD_METRICS

    X, y = _generate_calibrated_crowd_data()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    model = GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.10,
        max_depth=3,
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))

    _CROWD_MODEL = model
    _CROWD_METRICS = {
        "mae_index": round(mae, 3),
        "rmse_index": round(rmse, 3),
        "r2_score": round(r2, 4),
        "sample_count": len(X),
        "test_sample_count": len(X_test),
    }

    return _CROWD_METRICS


def get_crowd_model_metrics() -> Dict[str, float]:
    """Returns evaluation metrics for the ML crowd model."""
    global _CROWD_MODEL, _CROWD_METRICS
    if _CROWD_MODEL is None:
        train_crowd_model()
    return _CROWD_METRICS


def predict_crowd_footfall(
    destination: Dict,
    month: str,
    is_peak_season: bool,
    weather_score: float,
) -> Tuple[float, str]:
    """
    Predicts tourist footfall index (0.0 to 10.0) and maps to categorical labels:
    - Low (< 4.0)
    - Moderate (4.0 to 7.0)
    - High (7.0 to 8.8)
    - Peak / Very High (> 8.8)
    """
    global _CROWD_MODEL
    if _CROWD_MODEL is None:
        train_crowd_model()

    feat = extract_crowd_features(destination, month, is_peak_season, weather_score)
    X = feat.reshape(1, -1)
    index_pred = float(_CROWD_MODEL.predict(X)[0])
    index_clamped = round(float(np.clip(index_pred, 1.0, 10.0)), 1)

    thresholds = settings.CROWD_THRESHOLDS
    if index_clamped < thresholds["low_max"]:
        category = "Low"
    elif index_clamped < thresholds["moderate_max"]:
        category = "Moderate"
    elif index_clamped < thresholds["high_max"]:
        category = "High"
    else:
        category = "Peak / Very High"

    return index_clamped, category
