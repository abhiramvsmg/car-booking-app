from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.models import UserRole, RideStatus

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: UserRole = UserRole.RIDER

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole
    profile_pic: Optional[str] = None
    rating_avg: float
    wallet_balance: float

    class Config:
        from_attributes = True

class DriverSeed(BaseModel):
    lat: float
    lng: float

class RideCreate(BaseModel):
    pickup_address: str
    drop_address: str
    pickup_lat: float
    pickup_lng: float
    drop_lat: float
    drop_lng: float
    car_category: str = "Mini"

class VehicleOption(BaseModel):
    type: str # Auto, Mini, SUV
    fare: float
    duration_secs: float
    distance_meters: float

class RideEstimate(BaseModel):
    options: List[VehicleOption]

class DriverRideResponse(BaseModel):
    id: int
    full_name: str
    vehicle_info: str
    license_plate: str
    rating: float

class RideResponse(BaseModel):
    id: int
    rider_id: int
    driver_id: Optional[int] = None
    driver: Optional[DriverRideResponse] = None
    pickup_address: str
    drop_address: str
    pickup_lat: float
    pickup_lng: float
    drop_lat: float
    drop_lng: float
    status: RideStatus
    car_category: str
    fare_estimate: float
    distance_meters: float
    duration_secs: float
    created_at: datetime

    class Config:
        from_attributes = True
