from fastapi import APIRouter, Depends

from app.api.v1.deps import get_current_user
from app.core.response import success

router = APIRouter()


@router.get("/overview")
def get_overview(current_user: dict = Depends(get_current_user)):
    return success({
        "message": "动态监测接口已连通",
        "currentUser": current_user["username"],
        "metrics": {
            "enterpriseCount": 1200,
            "riskCount": 8,
        },
    })
