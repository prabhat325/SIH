"""
User Feedback & Interaction Tracking API Endpoints.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.feedback import FeedbackEventRequest, FeedbackResponse
from app.services.feedback_service import (
    export_training_dataset,
    get_interaction_stats,
    log_interaction,
)

router = APIRouter(prefix="/feedback", tags=["User Feedback & ML Pipeline"])


@router.post("", response_model=FeedbackResponse, summary="Log User Interaction Event")
def record_user_feedback(payload: FeedbackEventRequest):
    """
    Logs user feedback events (destination_liked, destination_saved, destination_rejected,
    itinerary_generated, etc.) into the persistent interaction store for ML personalization.
    """
    res = log_interaction(
        user_id=payload.user_id,
        destination_id=payload.destination_id,
        event_type=payload.event_type,
        rating=payload.rating,
        context=payload.context,
    )
    return res


@router.get("/stats", summary="Get Feedback & Interaction Statistics")
def get_feedback_statistics():
    """
    Returns interaction counts, event breakdown, and ML retraining pipeline status.
    """
    return {
        "status": "success",
        **get_interaction_stats(),
    }


@router.get("/export-dataset", summary="Export Training Dataset for ML Reranker")
def export_dataset_for_ml(limit: int = Query(500, ge=1, le=5000)):
    """
    Exports logged user interactions formatted as a training dataset for the ML recommendation model.
    """
    records = export_training_dataset(limit=limit)
    return {
        "status": "success",
        "record_count": len(records),
        "dataset": records,
    }
