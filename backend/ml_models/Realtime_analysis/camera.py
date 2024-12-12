import cv2
import torch
import numpy as np
from PIL import Image
import clip
import yaml
import time
from ultralytics import YOLO

# Define Model Class (CLIP)
class Model:
    def __init__(self, settings_path: str = './settings.yaml'):
        with open(settings_path, "r") as file:
            self.settings = yaml.safe_load(file)

        self.device = self.settings['model-settings']['device']
        self.model_name = self.settings['model-settings']['model-name']
        self.threshold = self.settings['model-settings']['prediction-threshold']
        self.model, self.preprocess = clip.load(self.model_name,
                                                device=self.device)
        self.labels = self.settings['label-settings']['labels']
        self.labels_ = []
        for label in self.labels:
            text = 'a photo of ' + label  # will increase model's accuracy
            self.labels_.append(text)

        self.text_features = self.vectorize_text(self.labels_)
        self.default_label = self.settings['label-settings']['default-label']

    @torch.no_grad()
    def transform_image(self, image: np.ndarray):
        pil_image = Image.fromarray(image).convert('RGB')
        tf_image = self.preprocess(pil_image).unsqueeze(0).to(self.device)
        return tf_image

    @torch.no_grad()
    def tokenize(self, text: list):
        text = clip.tokenize(text).to(self.device)
        return text

    @torch.no_grad()
    def vectorize_text(self, text: list):
        tokens = self.tokenize(text=text)
        text_features = self.model.encode_text(tokens)
        return text_features

    @torch.no_grad()
    def predict_(self, text_features: torch.Tensor,
                 image_features: torch.Tensor):
        # Pick the top 5 most similar labels for the image
        image_features /= image_features.norm(dim=-1, keepdim=True)
        text_features /= text_features.norm(dim=-1, keepdim=True)
        similarity = image_features @ text_features.T
        values, indices = similarity[0].topk(1)
        return values, indices

    @torch.no_grad()
    def predict(self, image: np.array) -> dict:
        tf_image = self.transform_image(image)
        image_features = self.model.encode_image(tf_image)
        values, indices = self.predict_(text_features=self.text_features,
                                        image_features=image_features)
        label_index = indices[0].cpu().item()
        label_text = self.default_label
        model_confidance = abs(values[0].cpu().item())
        if model_confidance >= self.threshold:
            label_text = self.labels[label_index]

        prediction = {
            'label': label_text,
            'confidence': model_confidance
        }

        return prediction

# Real-Time Video Processing with Model
def real_time_analysis(model: Model, yolo_model: YOLO):
    # Initialize the webcam
    cap = cv2.VideoCapture(0)  # Use 0 for the default webcam or replace with the correct index

    if not cap.isOpened():
        print("Error: Cannot access the webcam.")
        return

    while True:
        # Capture a frame from the webcam
        ret, frame = cap.read()
        if not ret:
            print("Failed to capture image.")
            break

        # Resize the frame to a smaller resolution for faster inference
        frame_resized = cv2.resize(frame, (640, 480))  # Resize to 640x480

        # Measure inference time for YOLOv8
        start_time = time.time()

        # Perform inference on the frame with YOLOv8
        results = yolo_model.predict(frame_resized, conf=0.6, classes=[0, 1])  # Using class 0 (person) and class 1 (another object)

        # Measure inference time for YOLOv8
        inference_time = time.time() - start_time
        print(f"YOLOv8 Inference time: {inference_time:.4f} seconds")

        # Visualize the results on the frame using YOLOv8
        annotated_frame = results[0].plot()  # Annotated frame with detections

        # Run prediction using CLIP on the frame
        # prediction = model.predict(frame)
        # label = prediction['label']
        # confidence = prediction['confidence']
        # text = f"{label}: {confidence:.2f}"
        # print(text)

        # # If the label is not 'unknown', print 'violence: True'
        # if label != "Unknown":  # Assuming "unknown" is the default label

        #     print("violence: True")
        #     cv2.putText(annotated_frame, "violence: True", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)

        # Display the frame with YOLOv8 annotations
        cv2.imshow("Real-Time Analysis", annotated_frame)

        # Exit if the user presses the 'q' key
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release resources
    cap.release()
    cv2.destroyAllWindows()

# Initialize the CLIP model and YOLOv8 model
settings_path = './settings.yaml'  # Path to your settings file
clip_model = Model(settings_path)
yolo_model = YOLO("best.pt")  # Replace with your custom-trained YOLOv8 model

# Start real-time analysis with both models
real_time_analysis(clip_model, yolo_model)


def violenceDetection(model:Model,frame):
        prediction = model.predict(frame)
        label = prediction['label']
        confidence = prediction['confidence']
        text = f"{label}: {confidence:.2f}"
        print(text)
        is_violence=False
        # If the label is not 'unknown', print 'violence: True'
        if label != "Unknown":  # Assuming "unknown" is the default label
            is_violence=True
            print("violence: True")
            cv2.putText(frame, "violence: True", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
        return is_violence,frame
