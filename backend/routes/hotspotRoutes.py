from fastapi import APIRouter
from helpers.dataProcessing import DataProcessor
import json
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/get-hotspots")
async def get_hotspots():
    data_processor = DataProcessor()
    hotspots = data_processor.calculate_hotspot_cities()
    return JSONResponse(content={"hotspots": hotspots})

@router.get("/city-stats/{city_name}")
async def get_city_stats(city_name: str):
    data_processor = DataProcessor()
    stats = data_processor.get_city_stats(city_name)
    return JSONResponse(content={"stats": stats})

@router.get("/get-crime-data")
async def get_crime_data():
    data_processor = DataProcessor()
    data = data_processor.get_crime_data()
    return JSONResponse(content={"crime_data": data})
