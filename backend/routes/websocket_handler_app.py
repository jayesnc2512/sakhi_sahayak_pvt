import json
import os
import base64
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import aiofiles
from pydub import AudioSegment
from ml_models.speech_to_text import SpeechToText, EmotionDetector, KeywordDetector, SituationClassifier
import asyncio

router = APIRouter()

# Initialize the models
stt_model_path = "E:/SIH-SakhiSahayak/sakhi_sahayak_pvt/backend/ml_models/vosk-model-en-in-0.5"
speech_to_text = SpeechToText(stt_model_path)
emotion_detector = EmotionDetector()
keyword_detector = KeywordDetector()
classifier = SituationClassifier()

# Load models at startup
emotion_detector.load_model()
speech_to_text.load_model()

class AudioProcessor:
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
                    situation = await classifier.classify(danger_score, safe_score, keywords_detected)
                    print(f"Situation classified as: {situation}")

                    # Save or delete audio based on situation
                    if situation == "Danger":
                        danger_path = os.path.join('received_audio/danger', filename)
                        os.rename(original_file_path, danger_path)
                        print(f"Audio classified as Danger and saved: {danger_path}")
                    else:
                        os.remove(original_file_path)
                        print(f"Audio classified as Safe and discarded: {original_file_path}")
                    
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