from fastapi import APIRouter, Depends, HTTPException

from app.api.v1.deps import MOCK_USERS, get_current_user
from app.core.response import success
from app.core.security import create_access_token
from app.modules.auth.schemas import LoginRequest

router = APIRouter()


@router.post("/login")
def login(payload: LoginRequest):
    user = MOCK_USERS.get(payload.username)
    if not user or payload.password != user["password"]:
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    if not user.get("is_active"):
        raise HTTPException(status_code=403, detail="用户已被停用")

    token = create_access_token(user["username"])
    return success({
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "display_name": user["display_name"],
            "role": user["role"],
        },
    })


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return success({
        "id": current_user["id"],
        "username": current_user["username"],
        "display_name": current_user["display_name"],
        "role": current_user["role"],
    })
