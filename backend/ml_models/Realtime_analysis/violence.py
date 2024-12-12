import numpy as np
import cv2
from keras.models import load_model
from collections import deque
from datetime import datetime
import time
import asyncio
from workers.alerts_DB import alertsDB

class continuousViolenceDetector:
    @staticmethod
    def load_model(model_path):
        """Load the violence detection model."""
        print("[INFO] Loading model...")
        return load_model(model_path)

    @staticmethod
    def process_frame(frame):
        """Preprocess the frame for model input."""
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame = cv2.resize(frame, (128, 128)).astype("float32")
        frame = frame.reshape(128, 128, 3) / 255
        return frame

    @staticmethod
    def analyze_frame(frame, model, queue):
        """Analyze the frame and determine if violence is detected."""
        processed_frame = continuousViolenceDetector.process_frame(frame)
        preds = model.predict(np.expand_dims(processed_frame, axis=0))[0]
        queue.append(preds)
        results = np.array(queue).mean(axis=0)
        print(results)

        return (results > 0.40)[0]  # Returns True if violence is detected

    @staticmethod
    def display_output(frame, is_violence):
        """Display the output frame with violence status."""
        label = "Violence: Yes" if is_violence else "Violence: No"
        color = (0, 0, 255) if is_violence else (0, 255, 0)
        small_frame = cv2.resize(frame, (320, 240))

        cv2.putText(small_frame, label, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
        cv2.imshow("Output", small_frame)

    @staticmethod
    def log_alert():
        """Log the alert details."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[ALERT] Violence detected at {timestamp}.")
        with open("alert_log.txt", "a") as log:
            log.write(f"ALERT: Violence detected at {timestamp}.\n")

    @staticmethod
    def reset_alert():
        """Reset the alert mechanism."""
        return 0, time.time()

    @staticmethod
    async def run(input_source, websocket):
        """Run the violence detection on the video."""
        alert_duration=3
        model_path = "ml_models/vmodel.h5"
        model = continuousViolenceDetector.load_model(model_path)
        queue = deque(maxlen=128)
        consecutive_violence_frames = 0
        video_path=input_source["link"]
        video_capture = cv2.VideoCapture(video_path)
        last_alert_time = 0

        while True:
            ret, frame = video_capture.read()
            if not ret:
                break

            # Analyze the frame for violence
            is_violence = continuousViolenceDetector.analyze_frame(frame, model, queue)
            continuousViolenceDetector.display_output(frame, is_violence)

            if is_violence:
                consecutive_violence_frames += 1
            else:
                consecutive_violence_frames = 0

            # Trigger alert if violence detected for `alert_duration` seconds continuously
            if consecutive_violence_frames >= alert_duration * (video_capture.get(cv2.CAP_PROP_FPS) // 1):
                current_time = time.time()

                # Check if enough time has passed since the last alert
                if current_time - last_alert_time >= alert_duration:
                    await websocket.send_json({"message":"Violence Detected","input_source":input_source})
                    alert_data={
                            "source":0,
                            "source_id":input_source["id"],
                            "lat":input_source["lat"],
                            "lon":input_source["lon"],
                            "alert_message":"Violence Detected",
                        }
                    alertsDB.insertAlerts(alert_data)
                    continuousViolenceDetector.log_alert()
                    consecutive_violence_frames, last_alert_time = continuousViolenceDetector.reset_alert()

            # Break on 'q' key press
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
            await asyncio.sleep(0)  


        print("[INFO] Cleaning up...")
        video_capture.release()
        cv2.destroyAllWindows()


# Paths for the test video and model
# video_path =0  # Update with your video source path
# model_path = "ml_models/vmodel.h5"  # Update with your model file path

# Run the detector
