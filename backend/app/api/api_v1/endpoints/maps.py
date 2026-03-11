from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from app.services.maps import search_address

router = APIRouter()

@router.get("/search")
async def search(query: str):
    """
    Search for addresses proxy.
    """
    if not query:
        return []
    
    results = await search_address(query)
    return results

@router.get("/route")
async def get_route(
    pickup_lat: float,
    pickup_lng: float,
    drop_lat: float,
    drop_lng: float
):
    """
    Returns polyline coordinates between two points using OSRM fallback.
    """
    from app.services.maps import get_osrm_route
    route = await get_osrm_route(pickup_lat, pickup_lng, drop_lat, drop_lng)
    return route
