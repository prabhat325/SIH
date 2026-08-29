"""
Unified Machine Learning Model Manager & Inference Pipeline.

Coordinates training warm-up, status reporting, and inference for budget regression,
crowd forecasting, and recommendation reranking.
"""

from typing import Dict
from app.ml.budget_model import get_budget_model_metrics, train_budget_model
from app.ml.crowd_model import get_crowd_model_metrics, train_crowd_model
from app.ml.recommendation_model import ml_reranker


def warm_up_ml_models() -> Dict[str, Dict]:
    """
    Initializes and trains the ML models on startup.
    Returns the real evaluation metrics for SIH judges.
    """
    budget_metrics = train_budget_model()
    crowd_metrics = train_crowd_model()

    return {
        "budget_regressor": budget_metrics,
        "crowd_forecaster": crowd_metrics,
        "recommendation_reranker": ml_reranker.get_status(),
    }


def get_all_model_evaluations() -> Dict[str, Dict]:
    """
    Returns live validation metrics for all models without retraining.
    """
    return {
        "budget_regression_metrics": get_budget_model_metrics(),
        "crowd_forecasting_metrics": get_crowd_model_metrics(),
        "recommendation_reranker": ml_reranker.get_status(),
    }
