from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


def success(data: Any = None, message: str = "success") -> dict:
    return {
        "code": 0,
        "message": message,
        "data": data,
        "traceId": str(uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def error(code: int, message: str, data: Any = None) -> dict:
    return {
        "code": code,
        "message": message,
        "data": data,
        "traceId": str(uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
