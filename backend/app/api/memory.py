from fastapi import APIRouter

router = APIRouter()


@router.post("")
async def create_memory():
    return {"message": "Not implemented yet"}


@router.get("/{memory_id}")
async def get_memory(memory_id: str):
    return {"message": "Not implemented yet"}


@router.delete("/{memory_id}")
async def delete_memory(memory_id: str):
    return {"message": "Not implemented yet"}