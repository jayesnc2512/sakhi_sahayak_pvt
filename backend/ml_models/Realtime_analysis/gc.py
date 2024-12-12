import time
import cv2
from roboflow import Roboflow
from datetime import datetime
import json
import asyncio
import base64
import pytz
from workers.alerts_DB import alertsDB
from helpers.night import night
from ml_models.Realtime_analysis.gesture2 import GestureRecognizer
from ml_models.Realtime_analysis.violence import continuousViolenceDetector 
from collections import deque
import requests
from ml_models.Realtime_analysis.violence import continuousViolenceDetector
import tempfile



# Initialize the Roboflow client and model
class continuousGenderClassification:
    lone_woman_tracker = []
    surrounded_woman_tracker = []

    @staticmethod
    def initialize_roboflow():
        try:
            rf = Roboflow(api_key="0Hh1bvT2yb5UXrNloKWV")  # Replace with your Roboflow API key
            project = rf.workspace("gender").project("gender-bkoji")  # Replace with your workspace and project name
            model = project.version("1").model  # Replace with your model version
            return model
        except Exception as e:
            print(f"Error initializing Roboflow model: {e}")
            return None

    @staticmethod
    def process_video_input(input_source,websocket):
        try:
            if input_source == 0 or input_source == 1:  # System camera
                camera_index = int(input_source)
                cap = cv2.VideoCapture(camera_index)  # Open the system camera
            elif input_source.startswith("rtsp"):  # RTSP camera stream
                cap = cv2.VideoCapture(input_source)  # Open the RTSP stream
            else:  # Path to video file
                cap = cv2.VideoCapture(input_source)  # Open the video file
            
            if not cap.isOpened():
                print("Error: Cannot open the video stream or file.")
                return None, None
            
            # frame_rate = cap.get(cv2.CAP_PROP_FPS)  # Get the FPS of the video stream or file
            # frame_interval = int(round(frame_rate / fps))  # Calculate interval between frames to achieve desired FPS
            
            return cap
        except Exception as e:
            print(f"Error processing video input: {e}")
            return None, None

    @staticmethod
    def annotate_frame(frame, predictions):
        try:
            male_count = 0
            female_count = 0

            for pred in predictions:
                x, y, w, h = int(pred['x']), int(pred['y']), int(pred['width']), int(pred['height'])
                label = pred['class']
                confidence = pred['confidence']

                if label == 'male':
                    male_count += 1
                elif label == 'female':
                    female_count += 1

                cv2.rectangle(frame, (x-int(w/2), y-int(h/2)), 
                              (x + int(w/2), y + int(h/2)), (0, 255, 0), 2)
                cv2.putText(frame, f"{label}: {confidence:.2f}", 
                            (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            return frame, male_count, female_count
        except Exception as e:
            print(f"Error annotating frame: {e}")
            return frame, 0, 0

    
    @staticmethod
    async def process_video_feed(model, cap, websocket,input_source):
        try:
            frame_count = 0
            gesture2=GestureRecognizer()
            # original_fps = cap.get(cv2.CAP_PROP_FPS)
            # frame_interval = int(original_fps / fps) if original_fps > 0 else 15
            model_path = "ml_models/Realtime_analysis/vmodel.h5"
            vmodel = continuousViolenceDetector.load_model(model_path)
            queue = deque(maxlen=128)
            consecutive_violence_frames = 0
            last_alert_time = 0
            alert_duration=10


            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                frame_count += 1

                # if frame_count % frame_interval == 0:
                try:
                        inference = model.predict(frame, confidence=40, overlap=70)
                        predictions = inference.json()['predictions']
                        inference_result, processed_frame = gesture2.process_frame_gesture1(frame)
                        is_violence=continuousViolenceDetector.analyze_frame(frame,vmodel,queue)
                        label = "Violence: Yes" if is_violence else "Violence: No"
                        color = (0, 0, 255) if is_violence else (0, 255, 0)
                        # cv2.putText(processed_frame, label, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
                        # cv2.imshow("Output", small_frame)
                        if is_violence:
                            consecutive_violence_frames += 1
                        else:
                            consecutive_violence_frames = 0

                        # Trigger alert if violence detected for `alert_duration` seconds continuously
                        if consecutive_violence_frames >= alert_duration * (cap.get(cv2.CAP_PROP_FPS) // 1):
                            current_time = time.time()

                            # Check if enough time has passed since the last alert
                            if current_time - last_alert_time >= alert_duration:
                                proof_link=await continuousGenderClassification.uploadFrame(processed_frame)

                                websocket.send_json({"message":"Violence Detected","proof_link":proof_link,"input_source":input_source})
                                alert_data={
                                        "source":0,
                                        "source_id":input_source["id"],
                                        "lat":input_source["lat"],
                                        "lon":input_source["lon"],
                                        "alert_message":"Violence Detected",
                                        "proof_link":proof_link
                                    }
                                alertsDB.insertAlerts(alert_data)
                                consecutive_violence_frames, last_alert_time = continuousViolenceDetector.reset_alert()

                        print(f"gesture inference",inference_result)
                        frame, male_count, female_count = continuousGenderClassification.annotate_frame(processed_frame, predictions)
                        classification = night.classify_day_night(frame)
                        

                        cv2.putText(processed_frame, classification, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0, 255), 2)
                        cv2.putText(processed_frame, str(inference_result), (50, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0, 255), 2)
                        if(len(inference_result)==2):
                            await continuousGenderClassification.trigger_alert("SOS Gesture detected ",websocket,input_source,processed_frame)


                        # Resize the frame for display
                        # small_frame = cv2.resize(frame, (320, 240))
                        cv2.imshow("Video Feed", processed_frame)

                        nightStatus=None
                        if(classification=="Night"):
                            nightStatus=True
                        elif(classification=="Day"):
                            nightStatus=False

                        # Encode the frame to Base64
                        _, buffer = cv2.imencode('.jpg', frame)
                        encoded_frame = base64.b64encode(buffer).decode('utf-8')

                        # Create the output JSON
                        timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(time.time() + 5*3600 + 30*60))
                        output = {
                            "timestamp": timestamp,
                            "male_count": male_count,
                            "female_count": female_count,
                            
                        }
                        print(output)

                        # Send WebSocket message
                        # await websocket.send_json({"message": output,"image": encoded_frame})

                        # Process lone woman detection and woman surrounded detection
                        await continuousGenderClassification.detect_woman_surrounded(female_count, male_count, predictions, websocket,input_source,processed_frame)
                        await continuousGenderClassification.detect_lone_woman(female_count, male_count,nightStatus, websocket,input_source,processed_frame)

                except Exception as e:
                        print(f"Error during inference: {e}")

                # Allow event loop to process other tasks
                await asyncio.sleep(0)

                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

            cap.release()
            cv2.destroyAllWindows()

        except Exception as e:
            print(f"Error processing video feed: {e}")


    @staticmethod
    async def uploadFrame(frame):
            CLOUD_NAME = 'dqabgjv3y'
            UPLOAD_PRESET = 'ml_default'

            try:
                print("Uploading frame to Cloudinary...")

                # Write the frame to a temporary file
                with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_file:
                    temp_file_path = temp_file.name
                    cv2.imwrite(temp_file_path, frame)

                # Read the file as base64
                with open(temp_file_path, "rb") as file:
                    file_base64 = base64.b64encode(file.read()).decode('utf-8')

                # Upload to Cloudinary
                url = f"https://api.cloudinary.com/v1_1/{CLOUD_NAME}/upload"
                payload = {
                    "file": f"data:image/jpeg;base64,{file_base64}",  # Ensure correct MIME type
                    "upload_preset": UPLOAD_PRESET,
                }
                headers = {
                    "Content-Type": "application/json",
                }
                response = requests.post(url, json=payload, headers=headers)
                response.raise_for_status()

                result = response.json()
                print("Frame uploaded to Cloudinary:", result.get("secure_url"))
                return result.get("secure_url")

            except Exception as e:
                print("Failed to upload frame to Cloudinary:", e)
                return None


    @staticmethod
    async def detect_lone_woman(female_count, male_count,nightStatus,websocket,input_source,frame):
        # Get the current time in UTC and convert it to IST
        ist = pytz.timezone('Asia/Kolkata')
        current_time = datetime.now(ist)
        current_hour = current_time.hour
        print("current_hour",current_hour)

        # Check if time is between 20:00 (8 PM) and 06:00 (6 AM)
        # if current_hour >= 20 or current_hour < 6:
        if nightStatus==True:
            if female_count == 1:
                continuousGenderClassification.lone_woman_tracker.append(current_time)
                # Retain only the last 6 timestamps (last 3 seconds at 2 FPS)
                continuousGenderClassification.lone_woman_tracker=[t for t in continuousGenderClassification.lone_woman_tracker if (current_time - t).seconds <= 10]
                # Trigger alert if lone woman detected continuously for 3 seconds
                if len(continuousGenderClassification.lone_woman_tracker) >= 4:
                    await continuousGenderClassification.trigger_alert("lone women at night detected",websocket,input_source,frame)
                    # await websocket.send_json({"message":"Lone Women detected"})
                    continuousGenderClassification.lone_woman_tracker.clear()
            else:
                continuousGenderClassification.lone_woman_tracker.clear()

    @staticmethod
    async def detect_woman_surrounded(female_count, male_count, predictions,websocket ,input_source,frame):
        try:
            proximity_threshold=1000
            current_time = datetime.now()
            woman_positions = []
            man_positions = []
            print("women surrounded checking")
            # Extract bounding box centers for all females and males
            for pred in predictions:
                x, y, w, h = int(pred['x']), int(pred['y']), int(pred['width']), int(pred['height'])
                label = pred['class']

                if label == 'female':
                    woman_positions.append((x, y))
                elif label == 'male':
                    man_positions.append((x, y))

            # Check if exactly one woman is detected
            if len(woman_positions) == 1:
                woman_x, woman_y = woman_positions[0]  # Position of the lone woman
                men_within_proximity = 0

                # Count the number of men within the proximity threshold
                for man_x, man_y in man_positions:
                    distance = ((man_x - woman_x) ** 2 + (man_y - woman_y) ** 2) ** 0.5
                    print(f"dstance",distance)
                    if distance <= proximity_threshold:
                        men_within_proximity += 1
                print(f"men_within_proximity{men_within_proximity}")

                # If the woman is surrounded by 3 or more men within the proximity
                if men_within_proximity >= 2:
                    continuousGenderClassification.surrounded_woman_tracker.append(current_time)
                    # Retain only the last 6 timestamps (last 3 seconds at 2 FPS)
                    continuousGenderClassification.surrounded_woman_tracker = [
                        t for t in continuousGenderClassification.surrounded_woman_tracker if (current_time - t).seconds <= 10
                    ]

                    # Trigger alert if this condition persists for 3 seconds
                    if len(continuousGenderClassification.surrounded_woman_tracker) >= 3:
                        print("Woman surrounded by multiple men detected.")
                        await continuousGenderClassification.trigger_alert("Woman surrounded by multiple men detected.",websocket,input_source,frame)
                        continuousGenderClassification.surrounded_woman_tracker.clear()
                else:
                    continuousGenderClassification.surrounded_woman_tracker.clear()
            else:
                continuousGenderClassification.surrounded_woman_tracker.clear()
        except Exception as e:
            print(f"Error in detect_woman_surrounded: {e}")


    @staticmethod
    async def trigger_alert(message,websocket,input_source,frame):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        proof_link=await continuousGenderClassification.uploadFrame(frame)
        await websocket.send_json({"message":message,"proof_link":proof_link,"input_source":input_source})


        alert_data={
            "source":0,
            "source_id":input_source["id"],
            "lat":input_source["lat"],
            "lon":input_source["lon"],
            "alert_message":message,
            "proof_link":proof_link
        }
        await alertsDB.insertAlerts(alert_data)
        print(f"{timestamp} - ALERT: {message}")

    @staticmethod
    async def gender_classification_main(input_source,websocket):
        try:
            # fps = 2  # Set frames per second to process

            model = continuousGenderClassification.initialize_roboflow()
            if model is None:
                return
            input_video=input_source['link']
            print(input_video)
            if(input_video=='0'):
                input_video=int(input_video)
            cap = continuousGenderClassification.process_video_input(input_video,websocket)
            if cap:
               await continuousGenderClassification.process_video_feed(model, cap,websocket,input_source)
            else:
                print("Error: Could not initialize video feed.")
        except Exception as e:
            print(f"Error in main function: {e}")


# genderClassification.gender_classification_main("data\genderC.mp4")