"""
ML Recommendation Reranker Interface & Feature Extraction Pipeline.

Defines the feature extraction schema for ML-based reranking.
Implements an honest fallback mechanism: if no historical training checkpoint
is loaded, falls back to the calibrated Content + Context ranking engine.
"""

from typing import Dict, List, Optional, Union
import numpy as np
from app.config.settings import settings


class MLRecommendationReranker:
    """
    Modular ML Reranker Interface.
    Integrates ML score with Content and Contextual score when trained weights exist.
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        self.model = None
        self.is_trained = False

    def extract_ranking_features(
        self,
        base_similarity: float,
        user_prefs: Dict[str, float],
        destination: Dict,
        companion_match: bool,
        season_match: bool,
        budget_match: bool,
        weather_score: float,
        crowd_score: float,
    ) -> np.ndarray:
        """
        Extracts 18 feature dimensions for ML reranking:
        - 10 dimension-wise products (User_i * Dest_i)
        - Base cosine similarity
        - Companion match (0 or 1)
        - Season match (0 or 1)
        - Budget match (0 or 1)
        - Weather suitability score
        - Crowd index
        - Destination safety score
        - Destination popularity score
        """
        dim_matches = [
            float(user_prefs.get(feat, 0.0)) * float(destination.get(feat, 0.0))
            for feat in settings.PREFERENCE_FEATURES
        ]

        features = dim_matches + [
            float(base_similarity),
            1.0 if companion_match else 0.0,
            1.0 if season_match else 0.0,
            1.0 if budget_match else 0.0,
            float(weather_score),
            float(crowd_score),
            float(destination.get("safety_score", 8.5)),
            float(destination.get("popularity_score", 8.0)),
        ]
        return np.array(features, dtype=np.float64)

    def predict_score(
        self,
        features: np.ndarray,
        base_composite_score: float,
    ) -> float:
        """
        Predicts ranking score. If model is not yet trained with real clickstream data,
        honestly returns the base composite score.
        """
        if not self.is_trained or self.model is None:
            return base_composite_score

        try:
            X = features.reshape(1, -1)
            ml_pred = float(self.model.predict(X)[0])
            # Blend 70% Base Score + 30% ML Score
            return 0.70 * base_composite_score + 0.30 * ml_pred
        except Exception:
            return base_composite_score

    def get_status(self) -> Dict[str, Union[bool, str]]:
        return {
            "is_trained": self.is_trained,
            "architecture": "GradientBoostingClassifier / Tabular Reranker",
            "status": "ML-ready feature pipeline active (awaiting live interaction dataset for retraining)",
        }


ml_reranker = MLRecommendationReranker()
