from fastapi import WebSocket, WebSocketDisconnect
from typing import List
import uuid
import logging

# Set up basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LiveLocationHandler:
    def __init__(self):
        # Store the WebSocket connections for sending live locations
        self.active_connections: List[WebSocket] = []

    # Function to generate a unique live location link
    def generate_live_location_link(self) -> str:
        try:
            # Here we generate a unique session ID that will be used to create the link
            session_id = str(uuid.uuid4())
            return f"/live-location/{session_id}"
        except Exception as e:
            # Log the error if something goes wrong
            logger.error(f"Error generating live location link: {e}")
            raise

    # WebSocket endpoint to handle incoming location data from the React Native app
    async def receive_location(self, websocket: WebSocket, session_id: str):
        try:
            # Accept the WebSocket connection
            await websocket.accept()
            # Add the WebSocket connection to the list of active connections
            self.active_connections.append(websocket)
            logger.info(f"New connection established: {session_id}")

            while True:
                # Receive data (location) from the app
                data = await websocket.receive_json()
                # Process or broadcast the location data (send to all connected dashboards)
                await self.broadcast_location(data)
        except WebSocketDisconnect as e:
            # Log when a WebSocket disconnects
            self.active_connections.remove(websocket)
            logger.info(f"Connection closed: {session_id}")
        except Exception as e:
            # Log other errors
            logger.error(f"Error in receive_location: {e}")
            raise

    # Function to broadcast location updates to all connected dashboards
    async def broadcast_location(self, location_data: dict):
        try:
            # Send location data to all active WebSocket connections (e.g., dashboards)
            for connection in self.active_connections:
                await connection.send_json(location_data)
        except Exception as e:
            # Log any error that occurs during broadcasting
            logger.error(f"Error broadcasting location data: {e}")
            raise
