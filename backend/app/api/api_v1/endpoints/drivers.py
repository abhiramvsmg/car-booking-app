from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select
from app.api import deps
from app.core.database import get_session
from app.models.models import User, Driver

router = APIRouter()

@router.post("/status")
async def update_status(
    *,
    db: Session = Depends(get_session),
    status: str, # online, offline
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role != "driver":
        raise HTTPException(status_code=403, detail="Only drivers can update status")
    
    driver = current_user.driver_profile
    if not driver:
        # Auto-create driver profile if it doesn't exist for the driver user
        driver = Driver(user_id=current_user.id, vehicle_info="Standard Vehicle")
        db.add(driver)
        db.commit()
        db.refresh(driver)
        
    driver.status = "available" if status == "online" else "offline"
    db.add(driver)
    db.commit()
    
    return {"status": driver.status}

@router.post("/location")
async def update_location(
    *,
    db: Session = Depends(get_session),
    lat: float,
    lng: float,
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role != "driver":
        raise HTTPException(status_code=403, detail="Only drivers can update location")
    
    driver = current_user.driver_profile
    if not driver:
        raise HTTPException(status_code=400, detail="Driver profile not found")
        
    driver.current_lat = lat
    driver.current_lng = lng
    db.add(driver)
    db.commit()
    
    return {"message": "Location updated"}

@router.get("/nearby")
async def get_nearby_drivers(
    *,
    db: Session = Depends(get_session),
    lat: float,
    lng: float,
    radius: float = 5.0,
    current_user: User = Depends(deps.get_current_user)
):
    from app.services.matching import find_nearby_drivers
    drivers = await find_nearby_drivers(db, lat, lng, radius)
    
    if not drivers:
        from app.api.api_v1.endpoints.drivers import seed_drivers_impl
        await seed_drivers_impl(db, lat, lng, count=3)
        drivers = await find_nearby_drivers(db, lat, lng, radius)

    return [
        {
            "id": d.id,
            "lat": d.current_lat,
            "lng": d.current_lng,
            "vehicle_info": d.vehicle_info,
            "license_plate": d.license_plate,
            "rating": d.rating
        }
        for d in drivers
    ]

from app.schemas.schemas import DriverSeed

async def seed_drivers_impl(db: Session, lat: float, lng: float, count: int = 5):
    import random
    from app.models.models import Driver, User
    
    # Simple logic to create some "ghost" drivers
    new_drivers = []
    vehicle_types = [
        {"name": "Auto Rickshaw", "plate_prefix": "AR", "category": "Auto"},
        {"name": "Maruti Swift", "plate_prefix": "MI", "category": "Mini"},
        {"name": "Hyundai i10", "plate_prefix": "MI", "category": "Mini"},
        {"name": "Toyota Camry", "plate_prefix": "PR", "category": "Prime"},
        {"name": "Honda Civic", "plate_prefix": "PR", "category": "Prime"},
        {"name": "Toyota Fortuner", "plate_prefix": "SV", "category": "SUV"},
        {"name": "Mahindra XUV700", "plate_prefix": "SV", "category": "SUV"}
    ]
    
    for i in range(count):
        mock_email = f"driver_sim_{random.randint(10000, 99999)}@example.com"
        mock_user = User(
            email=mock_email,
            full_name=random.choice(["Rajesh Kumar", "Amit Singh", "Priya Sharma", "Suresh Raina", "Anjali Gupta"]),
            hashed_password="...", 
            role="driver"
        )
        db.add(mock_user)
        db.commit()
        db.refresh(mock_user)
        
        # Add slight offset
        offset_lat = (random.random() - 0.5) * 0.02
        offset_lng = (random.random() - 0.5) * 0.02
        
        v = random.choice(vehicle_types)
        plate = f"{v['plate_prefix']} {random.randint(10, 99)} {chr(random.randint(65, 90))}{chr(random.randint(65, 90))} {random.randint(1000, 9999)}"
        
        d = Driver(
            user_id=mock_user.id,
            vehicle_info=v['name'],
            car_category=v['category'],
            license_plate=plate,
            rating=round(random.uniform(4.2, 5.0), 1),
            status="available",
            current_lat=lat + offset_lat,
            current_lng=lng + offset_lng,
            is_active=True
        )
        db.add(d)
        new_drivers.append(d)
    
    db.commit()
    return new_drivers

@router.post("/seed")
async def seed_drivers(
    *,
    db: Session = Depends(get_session),
    seed_data: DriverSeed,
    current_user: User = Depends(deps.get_current_user)
):
    await seed_drivers_impl(db, seed_data.lat, seed_data.lng, count=5)
    return {"message": "Seeded 5 drivers"}
