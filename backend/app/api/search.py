from fastapi import APIRouter

router = APIRouter()


@router.post("")
async def search_memories():
    return {"message": "Not implemented yet"}