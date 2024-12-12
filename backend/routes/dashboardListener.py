from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from helpers.sendAlertsToDash import AlertHandler

router = APIRouter()

# Instantiate the AlertHandler class
alert_handler = AlertHandler()

@router.websocket("/alertListener")
async def websocket_connector(websocket: WebSocket):
    """
    WebSocket route for the dashboard to listen for alerts.
    """
    await alert_handler.add_dashboard_connection(websocket)

    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        await alert_handler.remove_dashboard_connection(websocket)
