from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def list_decisions():
    return {"message": "Not implemented yet"}


@router.get("/{decision_id}")
async def get_decision(decision_id: str):
    return {"message": "Not implemented yet"}