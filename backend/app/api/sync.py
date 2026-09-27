from fastapi import APIRouter

router = APIRouter()


@router.get("/status")
async def sync_status():
    return {"message": "Not implemented yet"}


@router.get("/queue")
async def sync_queue():
    return {"message": "Not implemented yet"}


@router.post("/retry")
async def retry_sync():
    return {"message": "Not implemented yet"}