from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, rides, drivers, payments, maps, admin, finance

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(rides.router, prefix="/rides", tags=["rides"])
api_router.include_router(drivers.router, prefix="/drivers", tags=["drivers"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(maps.router, prefix="/maps", tags=["maps"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(finance.router, prefix="/finance", tags=["finance"])
