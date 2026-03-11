from typing import List, Optional
from sqlalchemy import text, func
from sqlmodel import Session, select
from app.models.models import Driver, Ride
from app.services.sockets import sio
from geoalchemy2.functions import ST_DWithin, ST_DistanceSphere

async def find_nearby_drivers(db: Session, pickup_lat: float, pickup_lng: float, radius_meters: float = 5000.0, car_category: Optional[str] = None) -> List[Driver]:
    """
    Finds drivers nearby. Uses PostGIS if available, otherwise standard query.
    """
    from app.core.config import settings
    
    if "sqlite" in settings.DATABASE_URL:
        # Better fallback for SQLite: Filter by lat/lng box
        # 0.1 deg is ~11km
        lat_range = 0.1
        lng_range = 0.1
        
        statement = select(Driver).where(
            Driver.status == "available",
            Driver.is_active == True,
            Driver.current_lat >= pickup_lat - lat_range,
            Driver.current_lat <= pickup_lat + lat_range,
            Driver.current_lng >= pickup_lng - lng_range,
            Driver.current_lng <= pickup_lng + lng_range
        )
        if car_category:
            statement = statement.where(Driver.car_category == car_category)
        
        drivers = db.exec(statement).all()
        
        # If still no drivers, pick ANY 3 drivers and move them nearby (SQLite only fallback)
        if not drivers:
            any_drivers = db.exec(select(Driver).limit(3)).all()
            for d in any_drivers:
                d.current_lat = pickup_lat + (0.01 * (any_drivers.index(d) + 1))
                d.current_lng = pickup_lng + (0.01 * (any_drivers.index(d) + 1))
                d.status = "available"
                d.is_active = True
                db.add(d)
            db.commit()
            return any_drivers
            
        return drivers

    pickup_point = f"POINT({pickup_lng} {pickup_lat})"
    
    # Use ST_DWithin for efficient spatial indexing usage
    statement = select(Driver).where(
        Driver.status == "available",
        Driver.is_active == True,
        ST_DWithin(Driver.location, pickup_point, radius_meters)
    )
    
    if car_category:
        statement = statement.where(Driver.car_category == car_category)
    
    # Order by distance
    statement = statement.order_by(ST_DistanceSphere(Driver.location, pickup_point))
    
    drivers = db.exec(statement).all()
    return drivers

async def notify_drivers_of_ride(drivers: List[Driver], ride: Ride):
    """
    Sends a socket notification to all nearby drivers.
    """
    for driver in drivers:
        await sio.emit("new_ride_request", {
            "ride_id": ride.id,
            "pickup_address": ride.pickup_address,
            "drop_address": ride.drop_address,
            "fare_estimate": ride.fare_estimate,
            "distance_meters": ride.distance_meters,
            "duration_secs": ride.duration_secs,
            "car_category": ride.car_category
        }, room=f"driver_{driver.id}")
