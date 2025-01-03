import base64
import asyncio
from fastapi import APIRouter, WebSocket
from io import BytesIO
from PIL import Image
from helpers.videoTest import videoTest
from helpers.continuous_monitoring import continuousMonitoring
import json
import asyncio


router = APIRouter()

@router.websocket("/video-analysis")
async def video_analysis(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connection open")
    try:
        while True:
            # Receive the video path
            message = await websocket.receive_text()
            data = json.loads(message)
            video_path = data.get("path", None)
            print(f"Received video path: {video_path}")

            # Start the gender classification and violence detection tasks
            async def gender_classification_task():
                try:
                    await videoTest.invokeGenderClassification(video_path, websocket)
                except Exception as e:
                    print(f"Error in gender classification task: {e}")

            async def violence_detection_task():
                try:
                    await videoTest.invokeViolenceDetection(video_path, websocket)
                except Exception as e:
                    print(f"Error in violence detection task: {e}")

            # Run both tasks concurrently
            await asyncio.gather(
                gender_classification_task(),
                violence_detection_task()
            )
            await asyncio.sleep(0)  


    except Exception as e:
        print(f"Error in WebSocket handler: {e}")
    finally:
        await websocket.close()
        print("WebSocket connection closed")


@router.websocket("/base-alert")
async def video_analysis(websocket: WebSocket):
    await websocket.accept()

    print("WebSocket connection open")
    try:
        while True:
            # Receive the video path
            message = await websocket.receive_text()
            data = json.loads(message)
            invoke = data.get("invoke", None)
            print(f"Received video path: {invoke}")
            # await continuousMonitoring.startMontitoring(websocket)




            # Start the gender classification and violence detection tasks
            # async def gender_classification_task():
            #     try:
            #         await videoTest.invokeGenderClassification(video_path, websocket)
            #     except Exception as e:
            #         print(f"Error in gender classification task: {e}")

            # async def violence_detection_task():
            #     try:
            #         await videoTest.invokeViolenceDetection(video_path, websocket)
            #     except Exception as e:
            #         print(f"Error in violence detection task: {e}")

            # # Run both tasks concurrently
            # await asyncio.gather(
            #     gender_classification_task(),
            #     violence_detection_task()
            # )
            # await asyncio.sleep(0)  


    except Exception as e:
        print(f"Error in WebSocket handler: {e}")
    finally:
        await websocket.close()
        print("WebSocket connection closed")
        
