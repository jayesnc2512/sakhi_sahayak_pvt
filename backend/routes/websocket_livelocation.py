from fastapi import APIRouter, WebSocket
from fastapi.responses import JSONResponse
from helpers.handleLiveLocation import LiveLocationHandler
import logging

# Set up basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize the LiveLocationHandler to handle location logic
live_location_handler = LiveLocationHandler()

@router.get('/live-loc')
async def sendLiveLoc():
    try:
        # This function calls the function from handleLiveLocation.py to generate a live location link
        live_link = live_location_handler.generate_live_location_link()
        logger.info(f"Generated live location link: {live_link}")
        return JSONResponse(content={"live_location_link": live_link})
    except Exception as e:
        # Log error and respond with an error message
        logger.error(f"Error generating live location link: {e}")
        return JSONResponse(status_code=500, content={"error": "Internal server error"})
