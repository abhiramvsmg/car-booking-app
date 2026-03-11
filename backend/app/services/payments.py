import stripe
from app.core.config import settings

stripe.api_key = settings.STRIPE_API_KEY

def create_payment_intent(amount: float, currency: str = "usd"):
    if not settings.STRIPE_API_KEY:
        return {"id": "mock_intent_id", "client_secret": "mock_secret"}
        
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100), # Stripe expects amount in cents
            currency=currency,
        )
        return intent
    except Exception as e:
        print(f"Stripe error: {e}")
        return None
