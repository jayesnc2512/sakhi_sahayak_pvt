from vosk import Model, KaldiRecognizer
import json
import re
import wave
import os
import asyncio
from pydub import AudioSegment
from transformers import pipeline
import requests

class SpeechToText:
    def __init__(self, model_path, audio_rate=16000):
        self.model_path = model_path
        self.audio_rate = audio_rate
        self.model = None
        self.recognizer = None

    def load_model(self):
        """Load the Vosk model."""
        print("Loading Vosk model...")
        self.model = Model(self.model_path)
        self.recognizer = KaldiRecognizer(self.model, self.audio_rate)
        print("Model loaded successfully.")

    async def transcribe_from_file(self, audio_file_path, process_callback):
        """
        Asynchronously transcribe audio from a file.
        
        Args:
            audio_file_path (str): Path to the audio file
            process_callback (callable): Async callback function for processing transcriptions
        
        Returns:
            bool: Transcription completion status
        """
        print(f"Transcribing audio from file: {audio_file_path}")

        try:
            # Ensure model is loaded
            if not self.model:
                self.load_model()

            # Load the audio file and convert to the correct sample rate
            audio = AudioSegment.from_file(audio_file_path)
            if audio.frame_rate != self.audio_rate:
                print(f"Resampling audio from {audio.frame_rate} Hz to {self.audio_rate} Hz.")
                audio = audio.set_frame_rate(self.audio_rate)

            # Export the resampled audio to a temporary file
            temp_audio_path = "temp_resampled.wav"
            audio.export(temp_audio_path, format="wav")

            # Collect transcriptions
            transcriptions = []

            # Open the wav file
            with wave.open(temp_audio_path, "rb") as wf:
                while True:
                    data = wf.readframes(4096)
                    if not data:
                        break
                    
                    if self.recognizer.AcceptWaveform(data):
                        result = json.loads(self.recognizer.Result())
                        text = result.get("text", "").strip()
                        if text:
                            print(f"Transcribed Speech: {text}")
                            transcriptions.append(text)
                            # Call the process callback asynchronously
                            await process_callback(text)

                # Handle any remaining data
                final_result = json.loads(self.recognizer.FinalResult())
                text = final_result.get("text", "").strip()
                if text:
                    print(f"Final Transcribed Speech: {text}")
                    transcriptions.append(text)
                    await process_callback(text)

            # Clean up the temporary file
            os.remove(temp_audio_path)

            # Print all collected transcriptions
            print("All Transcriptions:", transcriptions)

            return True

        except Exception as e:
            print(f"Transcription error: {e}")
            return False

class EmotionDetector:
    def __init__(self, model_name="bhadresh-savani/distilbert-base-uncased-emotion"):
        self.model_name = model_name
        self.emotion_classifier = None

    def load_model(self):
        """Load pre-trained emotion detection model synchronously."""
        print("Loading emotion detection model...")
        try:
            self.emotion_classifier = pipeline(
                "text-classification", 
                model=self.model_name, 
                return_all_scores=True
            )
            print("Emotion detection model loaded successfully.")
        except Exception as e:
            print(f"Error loading emotion detection model: {e}")
            self.emotion_classifier = None

    async def detect_emotions(self, text):
        """Async method to detect emotions from the given text."""
        if not self.emotion_classifier:
            await self.load_model()
        
        print(f"Analyzing text for emotions: {text}")
        
        # Use asyncio to run potentially blocking inference in a separate thread
        results = await asyncio.to_thread(self.emotion_classifier, text)
        
        emotions = {item["label"]: item["score"] for item in results[0]}
        print(f"Detected emotions: {emotions}")
        
        # Return average danger and safe scores
        danger_emotions = ["fear", "distress", "anger"]
        safe_emotions = ["neutral", "happy"]
        
        # Average Danger Scores
        danger_scores = [emotions.get(emotion, 0) for emotion in danger_emotions]
        avg_danger_score = sum(danger_scores) / len(danger_scores) if danger_scores else 0

        # Average Safe Scores
        safe_scores = [emotions.get(emotion, 0) for emotion in safe_emotions]
        avg_safe_score = sum(safe_scores) / len(safe_scores) if safe_scores else 0

        print(f"Average Danger Score: {avg_danger_score}")
        print(f"Average Safe Score: {avg_safe_score}")
        
        return avg_danger_score, avg_safe_score

class KeywordDetector:
    def __init__(self):
        # Comprehensive list of keywords and phrases
        self.keywords_and_phrases = {
            "help": 1.0, "stop": 1.0, "no": 0.9, "please": 0.8, "stop it": 1.0,
            "please stop": 0.9, "help me": 1.0, "leave me": 1.0, 
            "don't touch me": 1.0, "stop it now": 0.9, "I need help": 1.0, 
            "call police": 1.0, "save me": 1.0, "I'm scared": 0.9,
            "don't hurt me": 0.9, "you're scaring me": 0.8, "it hurts": 0.9,
            "bachao": 1.0, "chhodo": 1.0, "police": 1.0, 
            "kaapathunga": 1.0, "vidunga": 1.0, "stay away": 0.8, 
        }

    async def detect_keywords_and_phrases(self, text):
        """Async method to detect keywords and phrases in the given text."""
        detected = []
        for phrase, weight in self.keywords_and_phrases.items():
            if re.search(rf"\b{re.escape(phrase)}\b", text, re.IGNORECASE):
                detected.append((phrase, weight))
        
        # Sort by weight for priority
        detected = sorted(detected, key=lambda x: x[1], reverse=True)
        print(f"Detected keywords and phrases: {detected}")
        return detected

    async def calculate_keyword_signal(self, detected):
        """Async method to calculate keyword signal based on weights."""
        if not detected:
            return 0
        signal = max(weight for _, weight in detected)  # Use max weight of detected phrases
        print(f"Calculated keyword signal: {signal}")
        return signal

class SituationClassifier:
    async def classify(self, danger_score, safe_score, keywords_detected, keyword_detector):
        """
        Async method to classify the situation into 'Safe' or 'Danger' 
        based on emotion & keyword weight.
        """
        # Calculate keyword signal using the provided keyword_detector
        keyword_signal = await keyword_detector.calculate_keyword_signal(keywords_detected)
        
        # Combine scores with weights
        keyword_weight = 0.7  # Increased weight for keyword detection
        emotion_weight = 0.3  # Reduced weight for emotion-based detection

        combined_danger_score = (keyword_signal * keyword_weight) + (danger_score * emotion_weight)
        print(f"Weighted Danger Score: {combined_danger_score}")

        if combined_danger_score > 0.5:  # Danger threshold
            situation = "Danger"
            print('situation: danger', )
        else:
            situation = "Safe"
            print('situation: safe')
        
        print(f"Situation classified as: {situation}")
        return situation


# Main processing pipeline
def process_transcription_pipeline(text):
    """Main pipeline processing."""
    # Detect emotions
    danger_score, safe_score = emotion_detector.detect_emotions(text)

    # Keyword detection
    detected_keywords = keyword_detector.detect_keywords_and_phrases(text)

    # Classify the situation
    situation = classifier.classify(danger_score, safe_score, detected_keywords)

    # Log output
    print("=" * 50)
    print(f"Text: {text}")
    print(f"Detected Keywords: {detected_keywords}")
    print(f"Avg Danger Emotion Score: {danger_score}")
    print(f"Avg Safe Emotion Score: {safe_score}")
    print(f"Situation: {situation}")
    print("=" * 50)

    
    # Send the detected situation to the backend
    backend_url = "http://your-backend-url.com/api/situation"  # Replace with your backend URL
    payload = {
        "situation": situation,
        "danger_score": danger_score,
        "safe_score": safe_score
    }

    try:
        response = requests.post(backend_url, json=payload)
        if response.status_code == 200:
            print("Successfully sent situation to the backend.")
        else:
            print(f"Failed to send situation to the backend. Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        print(f"An error occurred while sending data to the backend: {e}")

if __name__ == "__main__":
    # Set up classes
    stt_model_path = "E:/SIH-SakhiSahayak/sakhi_sahayak_pvt/backend/ml_models/vosk-model-en-in-0.5"
    speech_to_text = SpeechToText(stt_model_path)
    emotion_detector = EmotionDetector()
    keyword_detector = KeywordDetector()
    classifier = SituationClassifier()

    # Load Emotion detection model
    emotion_detector.load_model()

    # Load Speech to Text model
    speech_to_text.load_model()

    # Specify the audio file path
    audio_file_path = "E:/SIH-SakhiSahayak/sakhi_sahayak_pvt/backend/ml_models/audio.mp3"  # Change this to your audio file path

    # Start transcription from file & processing
    speech_to_text.transcribe_from_file(audio_file_path, process_callback=process_transcription_pipeline)