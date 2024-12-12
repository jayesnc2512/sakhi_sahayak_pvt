import os
from twilio.rest import Client
from dotenv import load_dotenv


load_dotenv()

# Environment variables
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
from_phone_number = os.getenv("TWILIO_FROM_PHONE")

def send_sms(message: str, to_phone_numbers: list):
    """
    Sends an SMS to a list of phone numbers.

    Args:
        message (str): The message to send.
        to_phone_numbers (list): List of phone numbers to send the message to.

    Returns:
        None
    """
    try:
        client = Client(account_sid, auth_token)

        for number in to_phone_numbers:
            try:
                sms = client.messages.create(
                    to=number,
                    from_=from_phone_number,
                    body=message
                )
                print(f"SMS sent to {number}! SID: {sms.sid}")
            except Exception as e:
                print(f"Error sending SMS to {number}: {str(e)}")

    except Exception as e:
        print(f"Error in send_sms function: {str(e)}")
        raise
