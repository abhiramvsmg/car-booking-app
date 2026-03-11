import os
from datetime import datetime
from sqlmodel import Session
from app.models.models import Ride, User
from app.core.database import engine

def generate_receipt_content(ride_id: int) -> str:
    """
    Generates a professional text-based receipt for the ride.
    In a full production environment, this would use WeasyPrint to create a PDF.
    """
    with Session(engine) as db:
        ride = db.get(Ride, ride_id)
        if not ride:
            return "Ride not found"
        
        rider = db.get(User, ride.rider_id)
        
        receipt_template = f"""
=========================================
        CAB BOOKING ELITE RECEIPT
=========================================
Rider: {rider.full_name if rider else 'Platinum Guest'}
Date: {ride.created_at.strftime('%Y-%m-%d %H:%M:%S')}
Ride ID: #{ride.id}
-----------------------------------------
FROM: {ride.pickup_address}
TO:   {ride.drop_address}
-----------------------------------------
Distance: {ride.distance_meters / 1000:.2f} km
Duration: {ride.duration_secs / 60:.1f} min
Vehicle: {ride.car_category}
-----------------------------------------
TOTAL FARE: ${ride.fare_estimate:.2f}
Status: PAID
-----------------------------------------
Thank you for riding with us!
=========================================
        """
        return receipt_template

def save_receipt_to_disk(ride_id: int, content: str):
    """
    Saves the receipt to a temporary directory for demo purposes.
    """
    receipt_dir = "receipts"
    if not os.path.exists(receipt_dir):
        os.makedirs(receipt_dir)
        
    file_path = f"{receipt_dir}/receipt_{ride_id}.txt"
    with open(file_path, "w") as f:
        f.write(content)
    return file_path
