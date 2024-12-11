from fastapi import APIRouter, WebSocket
from helpers.dataProcessing import DataProcessor
import json
from fastapi.responses import JSONResponse
from workers.camera_DB import cameraDB

router = APIRouter()

@router.get("/getCameras")
async def getAllCameras():
    try:
    # Await the asynchronous method call
        cameras = cameraDB.getAllCameras()
        return JSONResponse(content={"data": cameras})
    except Exception as e:
        print("error in getAllcameras",e)

