import base64
import asyncio
from fastapi import APIRouter, WebSocket
from io import BytesIO
from PIL import Image

router = APIRouter()

# Function to convert an image file to base64 (entire image, not just the path)
def image_to_base64(image_path):
    try:
        with open(image_path, "rb") as image_file:
            # Read the image file as binary and convert to base64
            encoded_image = base64.b64encode(image_file.read()).decode("utf-8")
            return encoded_image
    except Exception as e:
        print(f"Error encoding image {image_path}: {e}")
        return None

@router.websocket("/video-analysis")
async def video_analysis(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connection open")
    try:
        while True:
            message = await websocket.receive_text()  # Receive the video path
            print(f"Received video path: {message}")

            # Define the paths to the images you want to send
            image_paths = [
                "E:/SIH-SakhiSahayak/download(1).png",
                "E:/SIH-SakhiSahayak/download.png"
            ]
            
            # Send two images per second
            while True:
                for image_path in image_paths:
                    # Convert image to base64 (image, not just the path)
                    base64_image = image_to_base64(image_path)
                    if base64_image:
                        frame_data = {
                            "status": "processed",
                            "image_data": base64_image,  # The base64 encoded image data
                            "result": f"Image from {image_path} sent successfully",
                        }
                        await websocket.send_json(frame_data)
                        print(f"Sent image from {image_path}")
                        await asyncio.sleep(1)  # Asynchronously wait for 1 second between sends

    except Exception as e:
        print(f"Error in WebSocket handler: {e}")
    finally:
        await websocket.close()
        print("WebSocket connection closed")
