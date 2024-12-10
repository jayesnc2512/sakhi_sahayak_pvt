from fastapi import APIRouter, WebSocket
from helpers.dataProcessing import DataProcessor
import json
from fastapi.responses import JSONResponse
from workers.camera_DB import cameraDB

router = APIRouter()

@router.get("/")
async def getAllCameras():
    cameras= cameraDB.getAllCameras()
    return JSONResponse(content={"data": cameras})
