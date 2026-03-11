from app.core.database import engine, init_db
from app.models.models import SQLModel
import os

print("Force resetting database...")
try:
    # Drop all tables
    SQLModel.metadata.drop_all(engine)
    print("Tables dropped.")
    
    # Recreate all tables
    init_db()
    print("Database reset complete.")
except Exception as e:
    print(f"Error during reset: {e}")
