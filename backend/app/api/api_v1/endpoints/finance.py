from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.api import deps
from app.core.database import get_session
from app.models.models import User, PromoCode
from pydantic import BaseModel

router = APIRouter()

class PromoApply(BaseModel):
    code: str

class WalletTopUp(BaseModel):
    amount: float

@router.get("/wallet", response_model=dict)
async def get_wallet_balance(
    *,
    db: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_user)
):
    return {"balance": round(current_user.wallet_balance, 2)}

@router.post("/wallet/topup", response_model=dict)
async def topup_wallet(
    *,
    db: Session = Depends(get_session),
    topup: WalletTopUp,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Simulated wallet top-up via Stripe.
    """
    if topup.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid topup amount")
        
    current_user.wallet_balance += topup.amount
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Top-up successful", "new_balance": round(current_user.wallet_balance, 2)}

@router.post("/promos/validate", response_model=dict)
async def validate_promo(
    *,
    db: Session = Depends(get_session),
    promo_in: PromoApply,
    current_user: User = Depends(deps.get_current_user)
):
    statement = select(PromoCode).where(PromoCode.code == promo_in.code, PromoCode.is_active == True)
    promo = db.exec(statement).first()
    
    if not promo:
        raise HTTPException(status_code=404, detail="Invalid or expired promo code")
        
    return {
        "code": promo.code,
        "discount_percentage": promo.discount_percentage,
        "message": f"Promo applied: {promo.discount_percentage}% discount"
    }

@router.post("/promos/seed", response_model=dict)
async def seed_promos(
    *,
    db: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Helper to seed demo promos.
    """
    if current_user.role != "admin" and current_user.id != 1:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    promos = [
        PromoCode(code="ELITE20", discount_percentage=20),
        PromoCode(code="WELCOME50", discount_percentage=50),
        PromoCode(code="PLATINUM10", discount_percentage=10)
    ]
    
    for p in promos:
        existing = db.exec(select(PromoCode).where(PromoCode.code == p.code)).first()
        if not existing:
            db.add(p)
            
    db.commit()
    return {"message": "Demo promos seeded successfully"}
