from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL or "redis://localhost:6379/0",
    backend=settings.REDIS_URL or "redis://localhost:6379/0"
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task
def send_ride_receipt(email: str, ride_id: int):
    from app.services.receipts import generate_receipt_content, save_receipt_to_disk
    
    print(f"Generating and sending receipt for ride {ride_id} to {email}")
    content = generate_receipt_content(ride_id)
    file_path = save_receipt_to_disk(ride_id, content)
    
    return {"status": "success", "ride_id": ride_id, "file_path": file_path}
