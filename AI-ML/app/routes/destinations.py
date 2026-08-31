from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.destination import DestinationDetail
from app.services.destination_service import (
    format_destination_detail,
    get_destination_by_id,
    load_destinations,
    search_and_filter_destinations,
)

router = APIRouter(prefix="/destinations", tags=["Destinations & Exploration"])


@router.get("", summary="List & Filter Indian Destinations")
def list_destinations(
    query: Optional[str] = Query(None, description="Free text search on name, state, attractions, description"),
    state: Optional[str] = Query(None, description="Filter by state (e.g. Rajasthan, Kerala, Himachal Pradesh)"),
    region: Optional[str] = Query(None, description="Filter by region (North, South, East, West, North-East, Central)"),
    category: Optional[str] = Query(None, description="Filter by category (Hill Station, Heritage, Beach, Spiritual, Nature, Wildlife, Adventure)"),
    budget_level: Optional[int] = Query(None, ge=1, le=3, description="1=Budget, 2=Moderate, 3=Luxury"),
    max_cost_per_day: Optional[int] = Query(None, description="Maximum budget per day in INR"),
    ideal_for: Optional[str] = Query(None, description="Travel group: Solo, Couple, Family, Friends, Backpacker"),
    limit: int = Query(20, ge=1, le=250, description="Items per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
):
    """Returns a list of destinations matching the specified criteria."""
    result = search_and_filter_destinations(
        query=query,
        state=state,
        region=region,
        category=category,
        budget_level=budget_level,
        max_cost_per_day=max_cost_per_day,
        ideal_for=ideal_for,
        limit=limit,
        offset=offset,
    )
    return {
        "status": "success",
        **result,
    }


@router.get("/stats/summary", summary="Dataset Summary & Statistics")
def get_dataset_stats():
    """Returns high-level statistics of the destinations knowledge base."""
    all_dests = load_destinations()
    states = sorted(list(set(d["state"] for d in all_dests)))
    regions = sorted(list(set(d["region"] for d in all_dests)))
    categories = sorted(list(set(d["category"] for d in all_dests)))

    return {
        "status": "success",
        "total_destinations": len(all_dests),
        "total_states_and_uts": len(states),
        "states_covered": states,
        "regions_covered": regions,
        "categories_covered": categories,
    }


@router.get("/{destination_id}", response_model=DestinationDetail, summary="Get Destination Details by ID")
def get_destination_detail(destination_id: str):
    """Retrieves full metadata, top attractions, and coordinates for a single destination."""
    dest = get_destination_by_id(destination_id)
    if not dest:
        raise HTTPException(
            status_code=404,
            detail=f"Destination '{destination_id}' not found in knowledge base."
        )
    return format_destination_detail(dest)
