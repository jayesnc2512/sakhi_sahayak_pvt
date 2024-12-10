import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

# Environment variables
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
from_phone_number = os.getenv("TWILIO_FROM_PHONE")

vm_url_high = os.getenv("VOICEMAIL_URL_HIGH")
vm_url_med = os.getenv("VOICEMAIL_URL_MED")
vm_url_low = os.getenv("VOICEMAIL_URL_LOW")

def initiate_call(priority_config: dict, to_phone_numbers: list):
    """
    Initiates calls to a list of phone numbers based on priority.
    """
    try:
        priority = priority_config.get("priority", "low").lower()
        if priority == "high":
            recording_url = vm_url_high
        elif priority == "medium":
            recording_url = vm_url_med
        else:
            recording_url = vm_url_low

        client = Client(account_sid, auth_token)

        for number in to_phone_numbers:
            try:
                call = client.calls.create(
                    to=number,
                    from_=from_phone_number,
                    twiml=f'<Response><Play>{recording_url}</Play></Response>'
                )
                print(f"Call initiated to {number}! SID: {call.sid}")
            except Exception as e:
                print(f"Error initiating call to {number}: {str(e)}")

    except Exception as e:
        print(f"Error in initiate_call function: {str(e)}")
        raise
