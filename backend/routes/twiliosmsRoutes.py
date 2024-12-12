from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from helpers.twiliosms import send_sms
from workers.alerts_DB import alertsDB
import datetime
import re

router = APIRouter()

# Define the request body schema
class SmsRequest(BaseModel):
    message: str
    phone_numbers: List[str]
    lat: str
    lng:str

@router.post('/send-sms')
async def send_emergency_sms(request: SmsRequest):
    """
    Endpoint to send emergency SMS to a list of phone numbers.
    """
    try:
        # Extract data from request
        message = request.message
        phone_numbers = request.phone_numbers
        lat= request.lat
        lng= request.lng
        current_datetime = datetime.datetime.now().isoformat()
        url_pattern = r'https?://[^\s]+'
        urls = re.findall(url_pattern, message)
        proof_link = urls[0] if urls else None

        data= {
            "source":1,
            "source_id":6,
            "lat": lat,
            "lng":lng,
            "alert_message":"sos alert",
            "proof_link":proof_link,
            "timestamp":current_datetime,
            "read_status":0,
        }
        alertsDB.insertAlerts(data)


        # Call the Twilio function
        send_sms(message, phone_numbers)
        
        

        print("SMS sent successfully.")
        return {"status": "success", "message": "Emergency SMS sent."}
    except Exception as e:
        print(f"Error sending SMS: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sending SMS: {str(e)}")
