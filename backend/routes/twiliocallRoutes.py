from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from helpers.twillio import initiate_call

router = APIRouter()

# Define the request body schema
class EmergencyCallRequest(BaseModel):
    priority: str
    phone_numbers: List[str]

@router.post('/call-emergency-contacts')
async def initiate_emergency_calls(request: EmergencyCallRequest):
    """
    Endpoint to initiate emergency calls.
    Expects `priority` and `phone_numbers` in the request body.
    """
    try:
        # Extract data from request
        priority_config = {"priority": request.priority}
        emergency_numbers = request.phone_numbers

        # Call the Twilio function
        initiate_call(priority_config, emergency_numbers)

        print("Calls initiated successfully.")
        return {"status": "success", "message": "Emergency calls initiated."}
    except Exception as e:
        print(f"Error initiating emergency calls: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error initiating emergency calls: {str(e)}")
