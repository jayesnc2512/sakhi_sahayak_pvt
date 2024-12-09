import os
from twilio.rest import Client
from dotenv import load_dotenv
import json

load_dotenv()

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
from_phone_number = os.getenv("TWILIO_FROM_PHONE")
to_phone_number = os.getenv("TO_PHONE")

vm_url_high = os.getenv("VOICEMAIL_URL_HIGH")
vm_url_med = os.getenv("VOICEMAIL_URL_MED")
vm_url_low = os.getenv("VOICEMAIL_URL_LOW")

def initiate_call(priority_config: dict):

    priority = priority_config.get("priority", "low").lower()
    if priority == "high":
        recording_url = vm_url_high
    elif priority == "medium":
        recording_url = vm_url_med
    else:
        recording_url = vm_url_low

    client = Client(account_sid, auth_token)

    call = client.calls.create(
        to=to_phone_number,
        from_=from_phone_number,
        twiml=f'<Response><Play>{recording_url}</Play></Response>'
    )

    print(f"Call initiated! SID: {call.sid}")


if __name__ == "__main__":
    priority_json = '{"priority": "low"}'
    priority_config = json.loads(priority_json)

    initiate_call(priority_config)
