from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def list_conflicts():
    return {"message": "Not implemented yet"}


@router.post("/{conflict_id}/resolve")
async def resolve_conflict(conflict_id: str):
    return {"message": "Not implemented yet"}