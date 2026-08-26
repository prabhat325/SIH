"""
Predictive Travel Budget & Cost Estimator.

Implements both Rule-Based and Machine Learning (GradientBoosting) budget
estimators with automatic fallback, itemized expense allocation, and confidence bounds.
"""

from typing import Dict, List, Optional
from app.config.settings import settings
from app.ml.budget_model import predict_trip_cost
from app.services.destination_service import get_destination_by_id, load_destinations
from app.services.recommender import is_month_in_season


class RuleBasedBudgetEstimator:
    """
    Deterministic econometric cost estimator using domain multipliers:
    Cost = (Base Daily * Tier Multiplier * Days * Group Size) * Group Discount * Season Surge
    """

    @staticmethod
    def estimate(
        destination: Dict,
        days: int,
        group_size: int,
        tier: str,
        travel_month: Optional[str] = None,
    ) -> Dict:
        tier_lower = tier.lower().strip()
        tier_mult = settings.TIER_MULTIPLIERS.get(tier_lower, 1.0)
        base_daily = destination["avg_cost_per_day_inr"] * tier_mult

        if group_size == 1:
            group_discount = settings.GROUP_DISCOUNTS["solo"]
        elif group_size == 2:
            group_discount = settings.GROUP_DISCOUNTS["couple"]
        elif 3 <= group_size <= 5:
            group_discount = settings.GROUP_DISCOUNTS["small_group"]
        else:
            group_discount = settings.GROUP_DISCOUNTS["large_group"]

        season_factor_str = "Standard Season (Baseline pricing)"
        season_mult = 1.0
        if travel_month:
            if is_month_in_season(travel_month, destination.get("best_months", "")):
                season_mult = settings.SEASON_SURGE_MULTIPLIER
                season_factor_str = f"Peak Travel Season in {travel_month} (+20% accommodation surge)"
            else:
                season_mult = settings.OFF_PEAK_DISCOUNT_MULTIPLIER
                season_factor_str = f"Off-Peak / Monsoon Season in {travel_month} (-12% discounts)"

        per_person_day_cost = int(base_daily * group_discount * season_mult)
        total_cost = int(per_person_day_cost * days * group_size)

        pcts = settings.EXPENSE_BREAKDOWN_PCT
        accommodation = int(total_cost * pcts["accommodation"])
        food = int(total_cost * pcts["food"])
        transit = int(total_cost * pcts["transit"])
        activities = int(total_cost * pcts["activities"])
        misc = total_cost - (accommodation + food + transit + activities)

        return {
            "estimator_used": "Rule-Based Econometric Baseline",
            "total_estimated_cost_inr": total_cost,
            "cost_per_person_inr": int(total_cost / group_size),
            "cost_per_day_inr": int(total_cost / days),
            "budget_range_min_inr": int(total_cost * 0.90),
            "budget_range_max_inr": int(total_cost * 1.10),
            "breakdown": {
                "accommodation_inr": accommodation,
                "food_and_dining_inr": food,
                "local_transport_inr": transit,
                "activities_and_entry_fees_inr": activities,
                "miscellaneous_and_shopping_inr": misc,
            },
            "itemized_breakdown": {
                "accommodation_and_stay": accommodation,
                "food_and_dining": food,
                "local_transport_and_cabs": transit,
                "sightseeing_and_entry_passes": activities,
                "misc_and_contingency_buffer": misc,
            },
            "season_factor_applied": season_factor_str,
            "money_saving_tips": [
                f"Travel during shoulder months to save up to 20% on boutique hotel stays in {destination['destination']}.",
                "Book train/flight tickets at least 3-4 weeks in advance.",
                "Opt for homestays and government tourism guesthouses for authentic hospitality at great rates.",
                "Use local autos/buses or shared cabs instead of full-day private hires for short city sightseeing.",
            ],
        }


class MLBudgetEstimator:
    """
    GradientBoosting Regression Estimator trained on historical travel packages.
    Calculates cost prediction with confidence interval based on test-set MAE.
    """

    @staticmethod
    def estimate(
        destination: Dict,
        days: int,
        group_size: int,
        tier: str,
        travel_month: Optional[str] = None,
    ) -> Dict:
        is_peak = is_month_in_season(travel_month or "Nov", destination.get("best_months", ""))
        pred_cost, range_low, range_high = predict_trip_cost(
            destination=destination,
            days=days,
            group_size=group_size,
            budget_tier=tier,
            travel_month=travel_month or "Nov",
            is_peak_season=is_peak,
        )

        pcts = settings.EXPENSE_BREAKDOWN_PCT
        accommodation = int(pred_cost * pcts["accommodation"])
        food = int(pred_cost * pcts["food"])
        transit = int(pred_cost * pcts["transit"])
        activities = int(pred_cost * pcts["activities"])
        misc = pred_cost - (accommodation + food + transit + activities)

        season_str = (
            f"Peak Season Surge in {travel_month} (+20% accommodation surge)"
            if is_peak
            else f"Standard/Off-Peak Season in {travel_month}"
        )

        return {
            "estimator_used": "GradientBoosting Regressor (ML)",
            "total_estimated_cost_inr": pred_cost,
            "cost_per_person_inr": int(pred_cost / group_size),
            "cost_per_day_inr": int(pred_cost / days),
            "budget_range_min_inr": range_low,
            "budget_range_max_inr": range_high,
            "breakdown": {
                "accommodation_inr": accommodation,
                "food_and_dining_inr": food,
                "local_transport_inr": transit,
                "activities_and_entry_fees_inr": activities,
                "miscellaneous_and_shopping_inr": misc,
            },
            "itemized_breakdown": {
                "accommodation_and_stay": accommodation,
                "food_and_dining": food,
                "local_transport_and_cabs": transit,
                "sightseeing_and_entry_passes": activities,
                "misc_and_contingency_buffer": misc,
            },
            "season_factor_applied": season_str,
            "money_saving_tips": [
                f"Travel during shoulder months to save up to 20% on boutique hotel stays in {destination['destination']}.",
                "Book train/flight tickets at least 3-4 weeks in advance.",
                "Opt for homestays and government tourism guesthouses for authentic hospitality at great rates.",
                "Use local autos/buses or shared cabs instead of full-day private hires for short city sightseeing.",
            ],
        }


def estimate_trip_budget(
    destination_id: Optional[str] = None,
    destination_name: Optional[str] = None,
    days: int = 3,
    group_size: int = 1,
    tier: str = "moderate",
    travel_month: Optional[str] = None,
    use_ml: bool = True,
) -> Dict:
    """
    Calculates detailed predictive itemized travel expenses for Indian destinations.
    Attempts ML estimation first with automatic fallback to rule-based baseline.
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

    days = max(1, min(30, days))
    group_size = max(1, min(50, group_size))

    if use_ml:
        try:
            result = MLBudgetEstimator.estimate(
                destination=dest,
                days=days,
                group_size=group_size,
                tier=tier,
                travel_month=travel_month,
            )
        except Exception:
            result = RuleBasedBudgetEstimator.estimate(
                destination=dest,
                days=days,
                group_size=group_size,
                tier=tier,
                travel_month=travel_month,
            )
    else:
        result = RuleBasedBudgetEstimator.estimate(
            destination=dest,
            days=days,
            group_size=group_size,
            tier=tier,
            travel_month=travel_month,
        )

    return {
        "status": "success",
        "destination_id": dest["destination_id"],
        "destination": dest["destination"],
        "state": dest["state"],
        "days": days,
        "group_size": group_size,
        "tier": tier.capitalize(),
        **result,
    }
