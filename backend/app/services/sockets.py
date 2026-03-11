import socketio
from app.core.config import settings
from jose import jwt

# Create a Socket.IO server
# Using Redis only if configured, otherwise falls back to memory
mgr = None
if settings.REDIS_URL and str(settings.REDIS_URL).lower() != "none":
    try:
        mgr = socketio.AsyncRedisManager(settings.REDIS_URL)
    except Exception as e:
        print(f"Skipping Redis for SIO: {e}")
        mgr = None

sio = socketio.AsyncServer(
    async_mode="asgi",
    client_manager=mgr,
    cors_allowed_origins="*"
)

# Create an ASGI application for Socket.IO
socket_app = socketio.ASGIApp(sio)

@sio.event
async def connect(sid, environ, auth):
    print(f"Client connected: {sid}")
    if auth and auth.get("token"):
        try:
            payload = jwt.decode(
                auth["token"], settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            user_id = payload.get("sub")
            # In a real app, query role, but for now we trust the token
            # Store user_id in sid session
            await sio.save_session(sid, {"user_id": user_id})
        except Exception as e:
            print(f"Auth failed for {sid}: {e}")
            return False # Reject connection
    return True

@sio.event
async def update_location(sid, data):
    # data: {"lat": float, "lng": float, "driver_id": int}
    print(f"Location update from {sid}: {data}")
    # Broadcast to relevant riders
    await sio.emit("driver_location", data, room=f"ride_{data.get('ride_id')}")

@sio.event
async def join_ride(sid, data):
    # data: {"ride_id": int}
    await sio.enter_room(sid, f"ride_{data.get('ride_id')}")

@sio.event
async def join_driver_room(sid, data):
    # data: {"driver_id": int}
    await sio.enter_room(sid, f"driver_{data.get('driver_id')}")
