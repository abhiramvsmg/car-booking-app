import googlemaps
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Google Maps client
gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY) if settings.GOOGLE_MAPS_API_KEY else None

async def get_distance_matrix(origins, destinations):
    """
    Using Google Maps Distance Matrix API with OSRM/Haversine fallbacks.
    """
    if not gmaps:
        logger.info("Google Maps key missing. Using OSRM/Haversine fallback.")
        try:
            # Parse lat,lng from strings
            import httpx
            o_lat, o_lng = map(float, origins.split(','))
            d_lat, d_lng = map(float, destinations.split(','))
            
            # Try OSRM first for realistic driving distance
            async with httpx.AsyncClient() as client:
                url = f"http://router.project-osrm.org/table/v1/driving/{o_lng},{o_lat};{d_lng},{d_lat}?annotations=duration,distance"
                response = await client.get(url, timeout=5.0)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("distances"):
                        return {
                            "distance_meters": data["distances"][0][1],
                            "duration_secs": data["durations"][0][1]
                        }
        except Exception as e:
            logger.warning(f"OSRM Fallback failed: {e}")

        # Final mathematical fallback (Haversine)
        import math
        try:
            o_lat, o_lng = map(float, origins.split(','))
            d_lat, d_lng = map(float, destinations.split(','))
            
            R = 6371000 # Radius of earth in meters
            phi1, phi2 = math.radians(o_lat), math.radians(d_lat)
            dphi = math.radians(d_lat - o_lat)
            dlamba = math.radians(d_lng - o_lng)
            
            a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlamba/2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            distance = R * c
            
            # Assume 30km/h average speed (8.33 m/s)
            duration = distance / 8.33
            return {"distance_meters": round(distance), "duration_secs": round(duration)}
        except:
            return {"distance_meters": 5000, "duration_secs": 600}
        
    try:
        matrix = gmaps.distance_matrix(origins, destinations, mode="driving")
        if matrix['status'] == 'OK':
            element = matrix['rows'][0]['elements'][0]
            if element['status'] == 'OK':
                return {
                    "distance_meters": element['distance']['value'],
                    "duration_secs": element['duration']['value']
                }
    except Exception as e:
        logger.error(f"Google Maps Matrix Error: {e}")
        
    return {"distance_meters": 5000, "duration_secs": 600}

async def search_address(query: str):
    """
    Search for addresses using Google Maps Geocoding/Places API.
    Falls back to Photon (OpenStreetMap) if no API key.
    """
    if not gmaps:
        logger.info(f"Searching for: {query} using fallbacks.")
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                # 1. Try Photon (fast)
                response = await client.get(
                    "https://photon.komoot.io/api/",
                    params={"q": query, "limit": 5},
                    timeout=5.0
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get("features"):
                        formatted_results = []
                        for res in data.get("features", []):
                            props = res.get("properties", {})
                            parts = [props.get("name"), props.get("street"), props.get("city"), props.get("state"), props.get("country")]
                            display_name = ", ".join([p for p in parts if p])
                            coords = res.get("geometry", {}).get("coordinates", [0, 0])
                            formatted_results.append({
                                "display_name": display_name or "Unknown Location",
                                "lat": coords[1],
                                "lng": coords[0],
                                "place_id": str(props.get("osm_id", "osm"))
                            })
                        logger.info(f"Photon found {len(formatted_results)} results.")
                        return formatted_results

                # 2. Try Nominatim (slower but more detailed fallback)
                logger.info("Photon empty. Trying Nominatim fallback...")
                headers = {"User-Agent": "VibrantCabsDemo/1.0"}
                response = await client.get(
                    "https://nominatim.openstreetmap.org/search",
                    params={"q": query, "format": "json", "limit": 5},
                    headers=headers,
                    timeout=5.0
                )
                if response.status_code == 200:
                    data = response.json()
                    formatted_results = []
                    for res in data:
                        formatted_results.append({
                            "display_name": res.get("display_name"),
                            "lat": float(res.get("lat")),
                            "lng": float(res.get("lon")),
                            "place_id": str(res.get("place_id", "nom"))
                        })
                    logger.info(f"Nominatim found {len(formatted_results)} results for {query}.")
                    return formatted_results

        except Exception as e:
            logger.error(f"Geocoding Fallback Error: {e}")
            return []
        
    try:
        results = gmaps.geocode(query)
        formatted_results = []
        for res in results:
            formatted_results.append({
                "display_name": res["formatted_address"],
                "lat": res["geometry"]["location"]["lat"],
                "lng": res["geometry"]["location"]["lng"],
                "place_id": res.get("place_id", "gmap")
            })
        return formatted_results
    except Exception as e:
        logger.error(f"Google Maps Geocode Error: {e}")
        return []

async def get_osrm_route(pickup_lat: float, pickup_lng: float, drop_lat: float, drop_lng: float):
    """
    Fetches a high-fidelity route from OSRM.
    """
    import httpx
    try:
        async with httpx.AsyncClient() as client:
            url = f"http://router.project-osrm.org/route/v1/driving/{pickup_lng},{pickup_lat};{drop_lng},{drop_lat}?overview=full&geometries=geojson"
            response = await client.get(url, timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                if data.get("routes"):
                    # OSRM GeoJSON is [lng, lat], Leaflet wants [lat, lng]
                    coords = data["routes"][0]["geometry"]["coordinates"]
                    return [[c[1], c[0]] for c in coords]
    except Exception as e:
        logger.error(f"OSRM Routing Error: {e}")
    
    # Fallback: Straight line
    return [[pickup_lat, pickup_lng], [drop_lat, drop_lng]]

def calculate_fare(distance_meters: float, duration_secs: float, car_category: str = "Mini") -> float:
    # Rates per category
    rates = {
        "Auto": {"base": 3.0, "km": 1.0, "min": 0.3},
        "Mini": {"base": 5.0, "km": 1.5, "min": 0.5},
        "Prime": {"base": 8.0, "km": 2.0, "min": 0.7},
        "SUV": {"base": 12.0, "km": 3.0, "min": 1.0}
    }
    
    config = rates.get(car_category, rates["Mini"])
    
    distance_km = distance_meters / 1000
    duration_min = duration_secs / 60
    
    fare = config["base"] + (distance_km * config["km"]) + (duration_min * config["min"])
    return round(fare, 2)
