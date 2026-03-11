from sqlmodel import Session, select, create_engine
from app.models.models import User
from app.core.config import settings

engine = create_engine(settings.sync_database_url)

with Session(engine) as session:
    users = session.exec(select(User)).all()
    print("--- USER LIST ---")
    for u in users:
        print(f"ID: {u.id} | Email: {u.email} | Name: {u.full_name} | Role: {u.role}")
    print("--- END OF LIST ---")
