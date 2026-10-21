from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import (
    AppException,
    app_exception_handler,
    unhandled_exception_handler,
)
from app.core.response import success


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
)

origins = [
    item.strip()
    for item in settings.cors_origins.split(",")
    if item.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

app.include_router(
    api_router,
    prefix=settings.api_v1_prefix,
)


@app.get("/health", tags=["系统"])
def health():
    return success({
        "status": "ok",
        "service": settings.app_name,
        "database": "not_connected_in_stage_1",
    })
