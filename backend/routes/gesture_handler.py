import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from helpers.video_processor import VideoProcessor
from ml_models.gesture1 import GestureRecognizer

router = APIRouter()

@router.websocket("/gesture-analysis")
async def gesture_analysis(websocket: WebSocket):
    """
    WebSocket route to handle real-time gesture analysis.
    """
    await websocket.accept()
    print("WebSocket connection established for gesture analysis.")
    ges= GestureRecognizer()


    try:
        while True:
            # Receive a JSON message containing a base64-encoded frame
            message = await websocket.receive_text()
            data = json.loads(message)

            # Extract the base64-encoded frame from the received data
            
            base64_frame = data.get("frame", None)
            # print(f"base64_frame {base64_frame}")
            if not base64_frame:
                await websocket.send_json({"error": "No frame data provided"})
                continue
            
            # Process the frame using VideoProcessor
            result = VideoProcessor.analyze_frame(base64_frame,ges)

            # Check for errors in the processing
            if "error" in result:
                await websocket.send_json({"error": result["error"]})
                continue

            # Send the analysis results and the processed frame back to the front end
            response = {
                "inference": result["inference"],
                "processed_frame": result["processed_frame"]
            }
            await websocket.send_json(response)

    except WebSocketDisconnect:
        print("WebSocket connection closed.")
    except Exception as e:
        print(f"Error in WebSocket handler: {e}")
        await websocket.send_json({"error": f"Internal server error: {str(e)}"})
    finally:
        await websocket.close()
        print("WebSocket connection terminated.")
