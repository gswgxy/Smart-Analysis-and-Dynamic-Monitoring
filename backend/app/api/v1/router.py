from fastapi import APIRouter

from app.modules.auth.router import router as auth_router
from app.modules.monitoring.router import router as monitoring_router


api_router = APIRouter()

api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["认证"],
)

api_router.include_router(
    monitoring_router,
    prefix="/monitoring",
    tags=["动态监测"],
)
