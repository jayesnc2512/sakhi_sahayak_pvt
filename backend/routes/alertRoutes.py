from fastapi import APIRouter, WebSocket,HTTPException
from helpers.dataProcessing import DataProcessor
import json
from fastapi.responses import JSONResponse
from workers.alerts_DB import alertsDB

router = APIRouter()

@router.get("/")
async def getAlerts():
    alerts= alertsDB.getAlerts()
    return JSONResponse(content={"data": alerts})

@router.post("/read")
async def updateReadStatus(id: int):
    try:
        # Attempt to update the read status in the database
        await alertsDB.updateReadStatus(id)
        return JSONResponse(content={"data": "Updated successfully"})
    except Exception as e:
        # If there is an error during the update, return an error response
        raise HTTPException(status_code=500, detail="Failed to update read status: " + str(e))

@router.post("/complaint")
async def complaint(complaintData:dict):
    await alertsDB.addComplaint(complaintData)
    return JSONResponse(content={"success":True})

@router.get("/get-complaints")
async def getComplaints():
    comps=alertsDB.getComplaints()
    return JSONResponse(content={"data":comps})

