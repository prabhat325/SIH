"""
10-Dimensional Vector Space Operations for Tourism AI/ML Platform.

Implements mathematically robust vector normalization, validation, and
cosine similarity calculation with safe zero-vector handling.
"""

import math
from typing import Dict, List, Sequence, Union

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False

from app.config.settings import settings

FEATURE_DIMENSIONS = settings.PREFERENCE_FEATURES


def validate_and_normalize_vector(
    raw_vector: Sequence[Union[int, float]],
    target_dim: int = len(FEATURE_DIMENSIONS),
    clip_min: float = 0.0,
    clip_max: float = 5.0,
) -> List[float]:
    """
    Validates vector length and clips values to the expected [clip_min, clip_max] bounds.
    """
    if len(raw_vector) != target_dim:
        raise ValueError(
            f"Expected vector of dimension {target_dim}, but got dimension {len(raw_vector)}."
        )

    validated = []
    for val in raw_vector:
        try:
            f_val = float(val)
            if math.isnan(f_val) or math.isinf(f_val):
                f_val = 0.0
            clipped = max(clip_min, min(clip_max, f_val))
            validated.append(clipped)
        except (ValueError, TypeError):
            validated.append(0.0)

    return validated


def dict_to_preference_vector(prefs_dict: Dict[str, Union[int, float]]) -> List[float]:
    """
    Extracts the ordered 10-D preference vector from a dictionary of interest weights.
    """
    raw_vals = [prefs_dict.get(feat, 0.0) for feat in FEATURE_DIMENSIONS]
    return validate_and_normalize_vector(raw_vals)


def cosine_similarity(
    v1: Sequence[Union[int, float]],
    v2: Sequence[Union[int, float]],
) -> float:
    """
    Computes the cosine similarity between two non-zero vectors:
    similarity = dot(v1, v2) / (norm(v1) * norm(v2))

    Returns 0.0 if either vector is zero or empty.
    """
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0

    if HAS_NUMPY:
        a = np.array(v1, dtype=np.float64)
        b = np.array(v2, dtype=np.float64)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        dot_product = float(np.dot(a, b))
        sim = dot_product / (norm_a * norm_b)
        return float(np.clip(sim, 0.0, 1.0))
    else:
        dot_product = sum(float(a) * float(b) for a, b in zip(v1, v2))
        mag1 = math.sqrt(sum(float(a) ** 2 for a in v1))
        mag2 = math.sqrt(sum(float(b) ** 2 for b in v2))

        if mag1 == 0.0 or mag2 == 0.0:
            return 0.0

        sim = dot_product / (mag1 * mag2)
        return max(0.0, min(1.0, float(sim)))
