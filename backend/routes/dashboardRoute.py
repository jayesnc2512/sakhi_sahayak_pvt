from fastapi import APIRouter, WebSocket
from helpers.dataProcessing import DataProcessor
import json
from fastapi.responses import JSONResponse
from workers.camera_DB import cameraDB
from workers.alerts_DB import alertsDB

router = APIRouter()

@router.get("/")
async def read_root():
    try:
    # Await the asynchronous method call
        cameras = cameraDB.getAllCameras()
        alerts= alertsDB.getAlerts()
        comps=alertsDB.getComplaints()

        data={
            "lenCameras":len(cameras),
            "alerts":alerts,
            "lenComplaints":len(comps),
        }
        return JSONResponse(content={"data": data})
    except Exception as e:
        print("error in getAllcameras",e)