from sqlmodel import create_engine, Session, SQLModel, select
from app.core.config import settings
from sqlalchemy import text

engine = create_engine(settings.sync_database_url, echo=True)

def init_db():
    try:
        from app.core import security
        from app.models.models import User, UserRole, Driver, Ride, PromoCode, Payment, Review
        from app.core.config import settings
        
        # 1. Ensure PostGIS extension is enabled (Only for Postgres)
        if settings.DATABASE_URL and "postgresql" in settings.DATABASE_URL:
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                conn.commit()
            
        # 2. Sync schema
        print("Syncing database schema...")
        # For demo purposes, we can try to add the column if it's missing (SQLite only)
        if "sqlite" in settings.DATABASE_URL:
            with engine.connect() as conn:
                try:
                    conn.execute(text("ALTER TABLE driver ADD COLUMN current_lat FLOAT;"))
                    conn.execute(text("ALTER TABLE driver ADD COLUMN current_lng FLOAT;"))
                    conn.commit()
                    print("Added missing coordinate columns to existing driver table.")
                except Exception:
                    # Column likely already exists
                    pass
        
        SQLModel.metadata.create_all(engine)
        
        with Session(engine) as session:
            # Seed default users
            if not session.exec(select(User).where(User.email == "abhiram@gmail.com")).first():
                print("Adding personalized user...")
                abhiram = User(
                    email="abhiram@gmail.com",
                    full_name="Abhiram",
                    hashed_password=security.get_password_hash("password123"),
                    role=UserRole.RIDER,
                    wallet_balance=500.0
                )
                session.add(abhiram)
            
            if not session.exec(select(User).where(User.email == "admin@example.com")).first():
                admin = User(
                    email="admin@example.com",
                    full_name="Platform Admin",
                    hashed_password=security.get_password_hash("admin123"),
                    role=UserRole.ADMIN,
                    wallet_balance=1000.0
                )
                session.add(admin)

            # Seed sample promos
            if not session.exec(select(PromoCode)).first():
                promos = [
                    PromoCode(code="ELITE20", discount_percentage=20),
                    PromoCode(code="WELCOME50", discount_percentage=50)
                ]
                for p in promos:
                    session.add(p)
                
            # Seed some drivers nearby (NYC coordinates by default)
            if not session.exec(select(Driver)).first():
                print("Adding default drivers with PostGIS locations...")
                drivers_data = [
                    {"name": "Rajesh Kumar", "car": "Maruti Swift", "cat": "Mini", "plate": "AR 01 MI 1234", "lat": 40.7128, "lng": -74.0060},
                    {"name": "Amit Singh", "car": "Toyota Camry", "cat": "Prime", "plate": "DL 02 PR 5678", "lat": 40.7150, "lng": -74.0020},
                    {"name": "Priya Sharma", "car": "Toyota Fortuner", "cat": "SUV", "plate": "MH 03 SV 9012", "lat": 40.7110, "lng": -74.0080},
                ]
                for d_data in drivers_data:
                    d_user = User(
                        email=f"{d_data['name'].lower().replace(' ', '_')}@example.com",
                        full_name=d_data['name'],
                        hashed_password=security.get_password_hash("driver123"),
                        role=UserRole.DRIVER
                    )
                    session.add(d_user)
                    session.commit()
                    session.refresh(d_user)
                    
                    driver = Driver(
                        user_id=d_user.id,
                        vehicle_info=d_data['car'],
                        car_category=d_data['cat'],
                        license_plate=d_data['plate'],
                        rating=4.9,
                        status="available",
                        location=f"POINT({d_data['lng']} {d_data['lat']})",
                        current_lat=d_data['lat'],
                        current_lng=d_data['lng']
                    )
                    session.add(driver)
            
            session.commit()
                
        print("Database initialized successfully with PostGIS.")
    except Exception as e:
        print(f"Error initializing database: {e}")

def get_session():
    with Session(engine) as session:
        yield session
