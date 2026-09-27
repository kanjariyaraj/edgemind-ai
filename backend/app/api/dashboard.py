from fastapi import APIRouter

router = APIRouter()


@router.get("/metrics")
async def dashboard_metrics():
    return {"message": "Not implemented yet"}