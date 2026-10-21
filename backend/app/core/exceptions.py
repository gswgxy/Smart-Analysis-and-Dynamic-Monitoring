from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.response import error


class AppException(Exception):
    def __init__(
        self,
        code: int = 40000,
        message: str = "请求失败",
        status_code: int = 400,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code


async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content=error(exc.code, exc.message),
    )


async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=error(50000, "服务器内部错误"),
    )
