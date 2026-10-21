from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_access_token


bearer_scheme = HTTPBearer(auto_error=False)

MOCK_USERS = {
    "admin": {
        "id": 1,
        "username": "admin",
        "display_name": "系统管理员",
        "role": "admin",
        "password": "admin123",
        "is_active": True,
    }
}


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    if credentials is None:
        raise HTTPException(status_code=401, detail="未登录")

    try:
        payload = decode_access_token(credentials.credentials)
        username = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Token无效或已过期")

    user = MOCK_USERS.get(username)
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")
    if not user.get("is_active"):
        raise HTTPException(status_code=403, detail="用户已被停用")

    return user
