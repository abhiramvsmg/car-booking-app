from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from enum import Enum
from geoalchemy2 import Geometry
from geoalchemy2.shape import to_shape
from sqlalchemy import Column
from app.core.config import settings

class UserRole(str, Enum):
    RIDER = "rider"
    DRIVER = "driver"
    ADMIN = "admin"

class RideStatus(str, Enum):
    REQUESTED = "requested"
    ACCEPTED = "accepted"
    PICKED_UP = "picked_up"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    full_name: str
    phone: Optional[str] = None
    hashed_password: str
    role: UserRole = Field(default=UserRole.RIDER)
    profile_pic: Optional[str] = None
    rating_avg: float = Field(default=5.0)
    wallet_balance: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    rides: List["Ride"] = Relationship(back_populates="rider")
    driver_profile: Optional["Driver"] = Relationship(back_populates="user")

class Driver(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    vehicle_info: str
    license_plate: str = Field(default="TBD-0000")
    rating: float = Field(default=5.0)
    is_verified: bool = Field(default=False)
    is_active: bool = Field(default=True)
    status: str = Field(default="offline") # offline, available, on_ride
    car_category: str = Field(default="Mini") # Auto, Mini, Prime, SUV
    
    # PostGIS Point or String fallback for SQLite
    if "sqlite" in settings.DATABASE_URL:
        location: Optional[str] = Field(default=None)
    else:
        location: Optional[str] = Field(
            default=None,
            sa_column=Column(Geometry(geometry_type='POINT', srid=4326))
        )

    # Coordinates for easy retrieval without PostGIS overhead
    current_lat: Optional[float] = Field(default=None)
    current_lng: Optional[float] = Field(default=None)

    user: User = Relationship(back_populates="driver_profile")
    rides: List["Ride"] = Relationship(back_populates="driver")

class Ride(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    rider_id: int = Field(foreign_key="user.id")
    driver_id: Optional[int] = Field(default=None, foreign_key="driver.id")
    pickup_address: str
    drop_address: str
    
    # Redundant but helpful for standard API responses
    pickup_lat: float
    pickup_lng: float
    drop_lat: float
    drop_lng: float
    
    # PostGIS Points or String fallbacks for SQLite
    if "sqlite" in settings.DATABASE_URL:
        pickup_point: str = Field(default="POINT(0 0)")
        drop_point: str = Field(default="POINT(0 0)")
    else:
        pickup_point: str = Field(sa_column=Column(Geometry(geometry_type='POINT', srid=4326)))
        drop_point: str = Field(sa_column=Column(Geometry(geometry_type='POINT', srid=4326)))
    
    status: RideStatus = Field(default=RideStatus.REQUESTED)
    car_category: str = Field(default="Mini")
    fare_estimate: float
    fare_actual: Optional[float] = None
    distance_meters: float
    duration_secs: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

    rider: User = Relationship(back_populates="rides", sa_relationship_kwargs={"foreign_keys": "Ride.rider_id"})
    driver: Optional[Driver] = Relationship(back_populates="rides")
    payment: Optional["Payment"] = Relationship(back_populates="ride")
    reviews: List["Review"] = Relationship(back_populates="ride")

class Payment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ride_id: int = Field(foreign_key="ride.id")
    stripe_payment_intent_id: str
    amount: float
    status: str # succeeded, pending, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)

    ride: Ride = Relationship(back_populates="payment")

class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ride_id: int = Field(foreign_key="ride.id")
    rater_id: int = Field(foreign_key="user.id")
    rated_id: int = Field(foreign_key="user.id")
    rating: int
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    ride: Ride = Relationship(back_populates="reviews")

class PromoCode(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(index=True, unique=True)
    discount_percentage: int
    is_active: bool = Field(default=True)
    expires_at: Optional[datetime] = None
