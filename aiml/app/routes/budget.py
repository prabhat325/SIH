"""
Predictive Travel Budget & Expense Estimation API Endpoints.
"""

from fastapi import APIRouter
from app.ml.budget_model import get_budget_model_metrics
from app.models.budget import BudgetEstimateRequest, BudgetEstimateResponse
from app.services.budget_service import estimate_trip_budget

router = APIRouter(prefix="/budget", tags=["Predictive Budget Estimator"])


@router.post("/estimate", response_model=BudgetEstimateResponse, summary="Estimate Itemized Trip Budget & Cost Breakdown")
@router.post("/predict", response_model=BudgetEstimateResponse, summary="ML Predict Itemized Trip Budget")
def estimate_cost(payload: BudgetEstimateRequest):
    """
    Calculates detailed itemized travel expenses for Indian destinations:
    - Uses trained GradientBoosting ML Regressor with Rule-Based Fallback.
    - Factors in group size economies of scale and peak/off-peak surges.
    - Provides uncertainty range (min/max) and money-saving tips.
    """
    result = estimate_trip_budget(
        destination_id=payload.destination_id,
        destination_name=payload.destination_name,
        days=payload.days,
        group_size=payload.group_size,
        tier=payload.tier,
        travel_month=payload.travel_month,
        use_ml=True,
    )
    return result


@router.get("/metrics", summary="Get ML Budget Regressor Evaluation Metrics")
def get_ml_metrics():
    """
    Returns genuine test-set evaluation metrics (MAE, RMSE, R²) for SIH judges.
    """
    return {
        "status": "success",
        "model_type": "GradientBoostingRegressor",
        "metrics": get_budget_model_metrics(),
    }
