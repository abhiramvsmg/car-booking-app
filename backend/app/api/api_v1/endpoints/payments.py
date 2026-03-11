import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlmodel import Session, select
from app.core.config import settings
from app.core.database import get_session
from app.models.models import Payment, Ride, RideStatus

router = APIRouter()

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: Session = Depends(get_session)
):
    if not settings.STRIPE_WEBHOOK_SECRET:
        # For development, just log
        print("Stripe webhook secret not set. Skipping signature verification.")
        payload = await request.body()
        event = stripe.Event.construct_from(await request.json(), stripe.api_key)
    else:
        payload = await request.body()
        try:
            event = stripe.Webhook.construct_event(
                payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        # Find payment by stripe ID
        statement = select(Payment).where(Payment.stripe_payment_intent_id == payment_intent["id"])
        payment = db.exec(statement).first()
        if payment:
            payment.status = "succeeded"
            db.add(payment)
            
            # Update ride status
            ride = db.get(Ride, payment.ride_id)
            if ride:
                ride.status = RideStatus.COMPLETED
                db.add(ride)
                
            db.commit()
            print(f"Payment {payment_intent['id']} succeeded. Ride {payment.ride_id} completed.")

    return {"status": "success"}
