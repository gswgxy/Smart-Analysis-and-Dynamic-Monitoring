from fastapi import APIRouter
from app.api.v1 import auth_router
from app.api.v1 import monitoring_router


api_router = APIRouter()


api_router.include_router(
    auth_router.router,
    prefix="/auth",
    tags=["认证"],
)

api_router.include_router(
    monitoring_router.router,
    prefix="/monitoring",
    tags=["动态监测"],
)
