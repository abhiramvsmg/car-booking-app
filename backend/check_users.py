from sqlmodel import Session, select, create_engine
from app.models.models import User
from app.core.config import settings

engine = create_engine(settings.sync_database_url)

with Session(engine) as session:
    users = session.exec(select(User)).all()
    print("CURRENT USERS IN DB:")
    for u in users:
        print(f"Email: {u.email}, Role: {u.role}")
