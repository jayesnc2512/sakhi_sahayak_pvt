import base64
import cv2
import numpy as np
from ml_models.gesture import process_frame
from ml_models.gesture1 import GestureRecognizer

class VideoProcessor:
    def __init__(self):
        pass

    @staticmethod
    def decode_frame(base64_frame):
        """
        Decode a base64-encoded frame into a NumPy array.
        """
        try:
            image_data = base64.b64decode(base64_frame)
            np_image = np.frombuffer(image_data, dtype=np.uint8)
            frame = cv2.imdecode(np_image, cv2.IMREAD_COLOR)
            return frame
        except Exception as e:
            print(f"Error decoding frame: {e}")
            return None

    @staticmethod
    def encode_frame(frame):
        """
        Encode a NumPy array frame to base64 format.
        """
        try:
            _, buffer = cv2.imencode(".jpg", frame)
            base64_frame = base64.b64encode(buffer).decode("utf-8")
            return base64_frame
        except Exception as e:
            print(f"Error encoding frame: {e}")
            return None

    @staticmethod
    def analyze_frame(base64_frame,ges):
        """
        Analyze a single frame and return inference results along with the processed frame.
        """
        # Decode frame
        frame = VideoProcessor.decode_frame(base64_frame)
        if frame is None:
            return {"error": "Invalid frame data"}

        # Process frame for gesture detection
        inference_result, processed_frame = ges.process_frame_gesture1(frame)

        # Encode the processed frame
        encoded_frame = VideoProcessor.encode_frame(processed_frame)

        return {
            "inference": inference_result,
            "processed_frame": encoded_frame
        }
