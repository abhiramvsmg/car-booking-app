from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_v1.api import api_router
from app.core.config import settings
import socketio
from app.services.sockets import sio
from app.core.database import init_db

# 1. Initialize the FastAPI application for REST logic
# 1. Initialize the FastAPI application for REST logic
fastapi_app = FastAPI(title=settings.PROJECT_NAME)

# 2. Apply CORS specifically to the FastAPI logic layer
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Lifecycle & Routes
@fastapi_app.on_event("startup")
def on_startup():
    print(f"[{settings.PROJECT_NAME}] Booting elite services...")
    init_db()

fastapi_app.include_router(api_router, prefix=settings.API_V1_STR)

@fastapi_app.get("/")
async def root():
    return {"message": "Cab Booking Elite Platinum API - Operational", "status": "online"}

# 4. Wrap with Socket.IO ASGIApp
# This ensures /socket.io is intercepted by SIO, and everything else falls through to FastAPI.
app = socketio.ASGIApp(
    sio, 
    other_asgi_app=fastapi_app,
    socketio_path="/socket.io"
)

if __name__ == "__main__":
    import uvicorn
    # Important: Reference the 'app' wrapper for uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
