from fastapi import APIRouter, WebSocket
from helpers.sendAlertsToDash import AlertHandler

router = APIRouter()

# Instantiate the AlertHandler class
alert_handler = AlertHandler()

@router.post("/app-emergency-listener")
async def listenToAppAlerts(alert: dict):
    print('inside listernToAppAlerts')
    """
    Endpoint to listen to alerts from the React Native app frontend.
    :param alert: Dictionary containing the alert data (e.g., location and optional audio link).
    """
    location = alert.get("location")
    audio_link = alert.get("audio_link")
    print('location:', location)
    if(audio_link):
        print('audio_link:', audio_link)

    # Check if location is provided
    if not location:
        return {"status": "error", "message": "Location is required"}

    # Call the function to process and send the alert to the dashboard
    await alert_handler.process_alert(location, audio_link)
    return {"status": "success", "message": "Alert processed"}
