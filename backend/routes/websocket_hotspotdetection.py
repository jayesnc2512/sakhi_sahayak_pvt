import asyncio
from fastapi import APIRouter, WebSocket
import json
from helpers.hotspotDetectionHelper import HotspotDetector  # Import the class

router = APIRouter()

# Initialize the HotspotDetector class
hotspot_detector = HotspotDetector()

@router.websocket('/hotspotDetection')
async def hotspot_detection(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive location data from client
            data = await websocket.receive_text()
            
            # Parse the JSON string to a Python dictionary
            location_data = json.loads(data)
            print('location_data', location_data)
            # Extract latitude and longitude
            latitude = location_data.get('latitude')
            longitude = location_data.get('longitude')

            if latitude is None or longitude is None:
                # If either latitude or longitude is missing, handle the error
                await websocket.send_text('{"error": "Invalid location data"}')
                continue

            # Call the HotspotDetector method to check proximity
            is_near_hotspot = await hotspot_detector.check_proximity((latitude, longitude))

            # Send message to the client based on proximity
            if is_near_hotspot:
                await websocket.send_text('{"vibrate": true}')  # Trigger vibration and notification
            else:
                await websocket.send_text('{"vibrate": false}')
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await websocket.close()
