"""
Geographic Distance & Route Optimization Utilities.

Implements the Haversine formula for calculating spherical distance between
coordinates and nearest-neighbor route sequencing for attraction planning.
"""

import math
from typing import Dict, List, Optional, Tuple


def haversine_distance_km(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:
    """
    Computes great-circle distance between two pairs of coordinates in kilometers.
    """
    # Earth radius in kilometers
    R = 6371.0

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return round(R * c, 2)


def compute_distance_matrix(
    locations: List[Dict[str, float]],
) -> List[List[float]]:
    """
    Constructs an N x N distance matrix for a list of location dicts containing 'latitude' & 'longitude'.
    """
    n = len(locations)
    matrix = [[0.0] * n for _ in range(n)]

    for i in range(n):
        for j in range(i + 1, n):
            d = haversine_distance_km(
                locations[i]["latitude"],
                locations[i]["longitude"],
                locations[j]["latitude"],
                locations[j]["longitude"],
            )
            matrix[i][j] = d
            matrix[j][i] = d

    return matrix


def order_attractions_greedy_tsp(
    attractions: List[Dict],
    start_index: int = 0,
) -> List[Dict]:
    """
    Sequences attractions using a greedy nearest-neighbor TSP heuristic
    to minimize back-and-forth travel time.
    """
    if len(attractions) <= 1:
        return attractions

    # If coordinates are missing or zero, fallback to original order
    has_coords = all(
        a.get("latitude") and a.get("longitude") for a in attractions
    )
    if not has_coords:
        return attractions

    unvisited = list(range(len(attractions)))
    current = start_index if start_index in unvisited else 0
    route_indices = [current]
    unvisited.remove(current)

    while unvisited:
        curr_loc = attractions[current]
        nearest_idx = min(
            unvisited,
            key=lambda idx: haversine_distance_km(
                curr_loc["latitude"],
                curr_loc["longitude"],
                attractions[idx]["latitude"],
                attractions[idx]["longitude"],
            ),
        )
        route_indices.append(nearest_idx)
        unvisited.remove(nearest_idx)
        current = nearest_idx

    return [attractions[i] for i in route_indices]
