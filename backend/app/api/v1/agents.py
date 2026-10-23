from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.core.response import success
from app.schemas.agent import ChatRequest

router = APIRouter()


@router.post("/chat")
def chat(payload: ChatRequest, current_user: dict = Depends(get_current_user)):
    return success({
        "message": payload.message,
        "user": current_user["username"],
    })