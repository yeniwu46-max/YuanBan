import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.dev_setup import ensure_local_database
from app.mqtt.subscriber import mqtt_subscriber
from app.routers import api, simulator

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    if settings.is_sqlite:
        ensure_local_database()
    mqtt_subscriber.start()
    yield
    mqtt_subscriber.stop()


app = FastAPI(title="Yuanbanban API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router)
app.include_router(simulator.router)


@app.get("/health")
def health() -> dict:
    settings = get_settings()
    return {
        "status": "ok",
        "service": "yuanbanban-api",
        "database": "sqlite" if settings.is_sqlite else "postgresql",
        "mqtt_enabled": settings.mqtt_enabled,
        "redis_enabled": settings.redis_enabled,
    }
