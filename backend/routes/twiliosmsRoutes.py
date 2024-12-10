from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from helpers.twiliosms import send_sms

router = APIRouter()

# Define the request body schema
class SmsRequest(BaseModel):
    message: str
    phone_numbers: List[str]

@router.post('/send-sms')
async def send_emergency_sms(request: SmsRequest):
    """
    Endpoint to send emergency SMS to a list of phone numbers.
    """
    try:
        # Extract data from request
        message = request.message
        phone_numbers = request.phone_numbers

        # Call the Twilio function
        send_sms(message, phone_numbers)

        print("SMS sent successfully.")
        return {"status": "success", "message": "Emergency SMS sent."}
    except Exception as e:
        print(f"Error sending SMS: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sending SMS: {str(e)}")
