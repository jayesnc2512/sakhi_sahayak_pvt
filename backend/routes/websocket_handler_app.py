import json
import os
import base64
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import aiofiles
from pydub import AudioSegment
from ml_models.speech_to_text import SpeechToText, EmotionDetector, KeywordDetector, SituationClassifier
import asyncio
import requests
from helpers.twiliosms import send_sms
router = APIRouter()

# Initialize the models
stt_model_path = "E:/SIH-SakhiSahayak/sakhi_sahayak_pvt/backend/ml_models/vosk-model-en-in-0.5"
speech_to_text = SpeechToText(stt_model_path)
emotion_detector = EmotionDetector()
keyword_detector = KeywordDetector()
classifier = SituationClassifier()

# Load models at startup
emotion= emotion_detector.load_model()
speech_to_text.load_model()

class AudioProcessor:
    @staticmethod
    def upload_to_cloudinary(local_file_path):
        CLOUD_NAME = 'dqabgjv3y'
        UPLOAD_PRESET = 'ml_default'

        try:
            print("In the function of upload to Cloudinary")

            # Read file as base64
            with open(local_file_path, "rb") as file:
                file_base64 = base64.b64encode(file.read()).decode('utf-8')

            # Upload to Cloudinary
            url = f"https://api.cloudinary.com/v1_1/{CLOUD_NAME}/upload"
            payload = {
                "file": f"data:audio/wav;base64,{file_base64}",  # Ensure correct MIME type
                "upload_preset": UPLOAD_PRESET,
            }
            headers = {
                "Content-Type": "application/json",
            }
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()

            result = response.json()
            print("Result:", result)
            print("File uploaded to Cloudinary:", result.get("secure_url"))
            # string="!!!EMERGENCY!!! Guest is in danger situation"
            # send_sms(string,["+918104782543", "+919067374010"])
            return result.get("secure_url")
        except Exception as e:
            print("Failed to upload file to Cloudinary:", e)



    def __init__(self):
        self.processing_lock = asyncio.Lock()
        self.audio_queue = asyncio.Queue()
        self.is_processing = False

    async def enqueue_audio(self, websocket, message):
        await self.audio_queue.put((websocket, message))
        if not self.is_processing:
            await self.start_processing()

    async def start_processing(self):
        self.is_processing = True
        try:
            while not self.audio_queue.empty():
                # Use a lock to ensure sequential processing
                async with self.processing_lock:
                    websocket, message = await self.audio_queue.get()
                    try:
                        await self.process_audio_file(websocket, message)
                    except Exception as e:
                        print(f"Error processing audio file: {e}")
                        await websocket.send_text(json.dumps({
                            "error": str(e),
                            "message": "Failed to process audio"
                        }))
                    finally:
                        self.audio_queue.task_done()
        except Exception as e:
            print(f"Processing queue error: {e}")
        finally:
            self.is_processing = False

    async def process_audio_file(self, websocket, message):
        # Check if the message contains 'audio' and 'location' data
        if message.get('type') == 'audio_location':
            filename = message.get('filename')
            audio_data = message.get('data')
            location = message.get('location')

            # Process location data (latitude, longitude)
            if location:
                latitude = location.get('lat')
                longitude = location.get('lng')
                print(f"Received location: Latitude = {latitude}, Longitude = {longitude}")
            
            # Create directories to save audio files if they don't exist
            os.makedirs('received_audio', exist_ok=True)
            os.makedirs('received_audio/danger', exist_ok=True)
            
            # Save the received audio file
            original_file_path = os.path.join('received_audio', filename)
            async with aiofiles.open(original_file_path, 'wb') as f:
                await f.write(base64.b64decode(audio_data))
            
            print(f"Received and saved audio file: {filename}")
            converted_file_path = os.path.splitext(original_file_path)[0] + ".mp3"

            try:
                # Convert the audio file to MP3 using pydub
                audio = AudioSegment.from_file(original_file_path)
                audio.export(converted_file_path, format="mp3")
                print(f"Audio file converted to MP3: {converted_file_path}")
                
                # Create a queue to collect transcription results
                transcription_queue = asyncio.Queue()
                
                # Modified process_callback to use the queue
                async def process_callback(text):
                    await transcription_queue.put(text)
                
                # Start transcription
                transcription_task = asyncio.create_task(
                    speech_to_text.transcribe_from_file(converted_file_path, process_callback)
                )
                
                # Collect all transcription results
                transcribed_texts = []
                try:
                    # Wait for transcription with a timeout
                    await asyncio.wait_for(transcription_task, timeout=10)
                    
                    # Collect all texts from the queue
                    while not transcription_queue.empty():
                        text = await transcription_queue.get()
                        transcribed_texts.append(text)
                        transcription_queue.task_done()
                
                except asyncio.TimeoutError:
                    print("Transcription timed out")
                
                # Combine all transcribed texts
                full_transcription = " ".join(transcribed_texts)
                print(f"Full Transcription: {full_transcription}")
                
                # Perform analysis
                if full_transcription:
                    # Emotion detection (await the async method)
                    danger_score, safe_score = await emotion_detector.detect_emotions(full_transcription)
                    print(f"Emotion Scores - Danger: {danger_score}, Safe: {safe_score}")

                    # Keyword detection (await the async method)
                    keywords_detected = await keyword_detector.detect_keywords_and_phrases(full_transcription)
                    print(f"Keywords detected: {keywords_detected}")

                    # Situation classification (await the async method)
                    situation = await classifier.classify(danger_score, safe_score, keywords_detected, keyword_detector)
                    print(f"Situation classified as: {situation}")

                    # Save or delete audio based on situation
                    if situation == "Danger":
                        try:
                            # Ensure the "danger" directory exists
                            danger_directory = os.path.join('received_audio', 'danger')
                            os.makedirs(danger_directory, exist_ok=True)

                            # Convert the audio file to MP3 using pydub
                            danger_path_mp3 = os.path.join(danger_directory, f"{os.path.splitext(filename)[0]}.mp3")
                            audio = AudioSegment.from_file(original_file_path)
                            audio.export(danger_path_mp3, format="mp3")
                            print(f"Audio file fully converted to MP3 and saved: {danger_path_mp3}")

                            # Upload the MP3 file to Cloudinary
                            cloudinary_url = AudioProcessor.upload_to_cloudinary(danger_path_mp3)
                            if cloudinary_url:
                                print(f"File uploaded to Cloudinary: {cloudinary_url}")
                                
                                # Construct and send the SMS with location and Cloudinary link
                                sms_message = (
                                    f"!!!EMERGENCY!!! Guest is in a danger situation.\n"
                                    f"Location: Latitude {latitude}, Longitude {longitude}\n"
                                    f"Audio evidence: {cloudinary_url}"
                                )
                                send_sms(sms_message, ["+918104782543", "+919067374010"])
                                # Send alert to appCallsListenerRoutes
                                alert_data = {
                                    "location": {"latitude": latitude, "longitude": longitude},
                                    "audio_link": cloudinary_url
                                }
                                try:
                                    response = requests.post(
                                        "https://7339-2409-40c0-1070-6544-493e-44a9-e6a0-1259.ngrok-free.app/ws/app-emergency-listener", json=alert_data
                                    )
                                    if response.status_code == 200:
                                        print(f"Alert sent to appCallsListenerRoutes successfully: {response.json()}")
                                    else:
                                        print(f"Failed to send alert to appCallsListenerRoutes: {response.status_code}, {response.text}")
                                except Exception as e:
                                    print(f"Error sending alert to appCallsListenerRoutes: {e}")
                            else:
                                print("Failed to upload file to Cloudinary.")

                            # Delete the local danger file after uploading
                            os.remove(danger_path_mp3)
                            print(f"Local danger file deleted: {danger_path_mp3}")

                        except Exception as e:
                            print(f"Error handling Danger file: {e}")

                else:
                    # Remove the file if classified as "Safe"
                    try:
                        os.remove(original_file_path)
                        print(f"Audio classified as Safe and discarded: {original_file_path}")
                    except Exception as e:
                        print(f"Error deleting safe file: {e}")
                    
                    # Send result back to WebSocket client
                    response = {
                        "situation": situation,
                        "danger_score": danger_score,
                        "safe_score": safe_score,
                        "keywords_detected": [kw for kw, _ in keywords_detected],
                        "transcription": full_transcription
                    }
                    print(f"Response being sent: {response}")
                    await websocket.send_text(json.dumps(response))
                
            except Exception as e:
                print(f"Error processing audio file: {e}")
                await websocket.send_text(json.dumps({
                    "error": str(e),
                    "message": "Failed to process audio"
                }))

# Create a global audio processor
audio_processor = AudioProcessor()

@router.websocket("/safemode-analysis")
async def safeModeAnalysis(websocket: WebSocket):
    print("Attempting WebSocket connection...")
    await websocket.accept()
    print("WebSocket connection established")
    
    try:
        while True:
            try:
                message_text = await websocket.receive_text()
                message = json.loads(message_text)
                
                # Enqueue the audio for processing
                await audio_processor.enqueue_audio(websocket, message)
                    
            except json.JSONDecodeError:
                print("Invalid JSON message received")
    
    except WebSocketDisconnect:
        print("WebSocket connection disconnected by client")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        try:
            await websocket.close()
            print("WebSocket connection closed")
        except Exception as e:
            print(f"Error closing WebSocket: {e}")

        # Cleanup: Delete all files in the 'recorded_audio' folder except those in the 'danger' folder
        try:
            recorded_audio_folder = 'recorded_audio'
            danger_folder = os.path.join('received_audio', 'danger')

            # List all files in the 'recorded_audio' folder
            for root, _, files in os.walk(recorded_audio_folder):
                for file in files:
                    file_path = os.path.join(root, file)
                    
                    # Check if the file is in the danger folder
                    danger_path = os.path.join(danger_folder, file)
                    if not os.path.exists(danger_path):
                        os.remove(file_path)
                        print(f"Deleted file: {file_path}")

            print(f"All non-danger files in '{recorded_audio_folder}' have been deleted.")
        except Exception as e:
            print(f"Error cleaning up 'recorded_audio' folder: {e}")