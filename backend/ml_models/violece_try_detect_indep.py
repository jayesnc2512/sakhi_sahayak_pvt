import numpy as np
import cv2
from keras.models import load_model
from collections import deque
from mtcnn import MTCNN
from matplotlib import pyplot as plt
from PIL import Image, ImageEnhance
import time

def getTime():
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

def imgenhance(input_image, output_image):
    """Enhance the image by adjusting sharpness and color."""
    try:
        image = Image.open(input_image)
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(1.3)  # Adjust sharpness factor
        # Enhance color
        enhancer = ImageEnhance.Color(image)
        image = enhancer.enhance(1.5)  # Adjust color factor
        image.save(output_image)
        print("[INFO] Image enhancement completed.")
    except Exception as e:
        print(f"[ERROR] Image enhancement failed: {e}")

def draw_faces(image_path, faces, output_path):
    """Draw rectangles around detected faces and save the output."""
    try:
        pixels = cv2.imread(image_path)
        for face in faces:
            x, y, width, height = face['box']
            cv2.rectangle(pixels, (x, y), (x + width, y + height), (0, 255, 0), 2)
        cv2.imwrite(output_path, pixels)
        print(f"[INFO] Faces saved to {output_path}.")
    except Exception as e:
        print(f"[ERROR] Failed to draw faces: {e}")

def detectViolence(video, model_path, output_video="recordedVideo.avi"):
    """Detect violence in a video."""
    try:
        print("[INFO] Loading model...")
        model = load_model(model_path)
        Q = deque(maxlen=128)
        vs = cv2.VideoCapture(video)
        writer = None
        (W, H) = (None, None)
        trueCount = 0
        imageSaved = 0
        sendAlert = 0

        while True:
            (grabbed, frame) = vs.read()
            if not grabbed:
                break

            if W is None or H is None:
                (H, W) = frame.shape[:2]

            output = frame.copy()
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = cv2.resize(frame, (128, 128)).astype("float32")
            frame = frame.reshape(128, 128, 3) / 255

            preds = model.predict(np.expand_dims(frame, axis=0))[0]
            Q.append(preds)

            results = np.array(Q).mean(axis=0)
            label = (results > 0.50)[0]
            text_color = (0, 255, 0) if not label else (0, 0, 255)
            trueCount += int(label)

            text = f"Violence: {label}"
            cv2.putText(output, text, (35, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.25, text_color, 3)

            if writer is None:
                fourcc = cv2.VideoWriter_fourcc(*"MJPG")
                writer = cv2.VideoWriter(output_video, fourcc, 30, (W, H), True)

            writer.write(output)
            cv2.imshow("Output", output)

            if trueCount == 40 and not sendAlert:
                if not imageSaved:
                    cv2.imwrite("savedImage.jpg", output)
                    imgenhance("savedImage.jpg", "finalImage.jpg")
                    imageSaved = 1

                detector = MTCNN()
                faces = detector.detect_faces(plt.imread("finalImage.jpg"))
                draw_faces("finalImage.jpg", faces, "faces.png")

                timeMoment = getTime()
                location = "KESAVADASAPURAM"
                with open("alert_log.txt", "a") as log:
                    log.write(f"ALERT: Violence detected!\n")
                    log.write(f"Time: {timeMoment}\n")
                    log.write(f"Location: {location}\n")
                    log.write(f"Saved Image: finalImage.jpg\n")
                    log.write(f"Faces Image: faces.png\n")
                    log.write(f"========================================\n")
                print(f"[ALERT] Violence detected at {timeMoment}. Location: {location}.")
                sendAlert = 1

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

        print("[INFO] Cleaning up...")
        writer.release()
        vs.release()
        cv2.destroyAllWindows()
    except Exception as e:
        print(f"[ERROR] An error occurred: {e}")

# Paths for the test video and model
V_path = "rtsp://192.168.1.8:8080/h264.sdp"  # Update with your violence video file path
model_path = "ml_models/vmodel.h5"  # Update with your model file path

detectViolence(V_path, model_path)
