from fastapi import APIRouter, WebSocket
from helpers.dataProcessing import DataProcessor
import json
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/get-hotspots")
async def get_hotspots():
    hotspots = DataProcessor.calculate_hotspot_cities()
    hotspots_list = hotspots.to_dict(orient='records')

    return JSONResponse(content={"hotspots": hotspots_list})

@router.get("/city-stats/{city_name}")
async def get_city_stats(city_name: str):
    stats = DataProcessor.get_city_stats(city_name)
    return JSONResponse(content={"stats": stats})

@router.get("/get-crime-data")
async def get_crime_data():
    data = DataProcessor.get_crime_data()
    return JSONResponse(content={"crime_data": data})


