# Import necessary libraries
from inference_sdk import InferenceHTTPClient
import cv2
import numpy as np
from datetime import datetime

# Initialize the inference client
CLIENT = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key="oWW9w4FYndkZO5g4VTUE"
)

# Function to draw annotations on the frame and highlight threat situations
def annotate_frame(frame, detections, current_time):
    men_count = 0
    women_count = 0
    threat_detected = False

    # Separate men and women detections for threat analysis
    men_positions = []
    women_positions = []

    # Annotate each detection
    for detection in detections:
        class_name = detection['class']  # Either 'man' or 'woman'
        x = int(detection['x'])  # Center X of the bounding box
        y = int(detection['y'])  # Center Y of the bounding box
        width = int(detection['width'])  # Width of the bounding box
        height = int(detection['height'])  # Height of the bounding box
        # Calculate top left and bottom right corners of bounding box
        top_left = (x - width // 2, y - height // 2)
        bottom_right = (x + width // 2, y + height // 2)
        
        # Set color based on gender
        if class_name == 'woman':
            color = (0, 255, 0)  # Green for woman
            women_count += 1
            women_positions.append((x, y, width, height))
        else:
            color = (0, 0, 255)  # Red for man
            men_count += 1
            men_positions.append((x, y, width, height))
        
        # Draw rectangle and label
        cv2.rectangle(frame, top_left, bottom_right, color, 2)
        cv2.putText(frame, class_name, (top_left[0], top_left[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

    # Check for "Woman Surrounded by Men" threat
    for woman in women_positions:
        men_nearby = 0
        woman_x, woman_y, woman_width, woman_height = woman

        for man in men_positions:
            man_x, man_y, man_width, man_height = man
            # Check distance between man and woman
            distance = np.sqrt((man_x - woman_x) ** 2 + (man_y - woman_y) ** 2)
            if distance < 100:  # Example proximity threshold
                men_nearby += 1

        if men_nearby >= 3:  # If surrounded by 3 or more men
            threat_detected = True
            # Highlight this woman with a red bounding box
            cv2.rectangle(frame, 
                          (woman_x - woman_width // 2, woman_y - woman_height // 2),
                          (woman_x + woman_width // 2, woman_y + woman_height // 2),
                          (0, 0, 255), 4)  # Red border for threat
            cv2.putText(frame, "THREAT: Woman Surrounded by Men", 
                        (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    # Check for "Lone Woman at Night" threat
    if women_count == 1 and men_count == 0 and current_time.hour >= 20:  # After 8 PM
        threat_detected = True
        lone_woman = women_positions[0]
        woman_x, woman_y, woman_width, woman_height = lone_woman
        # Highlight the lone woman
        cv2.rectangle(frame, 
                      (woman_x - woman_width // 2, woman_y - woman_height // 2),
                      (woman_x + woman_width // 2, woman_y + woman_height // 2),
                      (0, 0, 255), 4)  # Red border for threat
        cv2.putText(frame, "THREAT: Lone Woman at Night", 
                    (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    # Display the count of men and women on the top-left corner of the frame
    text = f"Men: {men_count}  Women: {women_count}"
    cv2.putText(frame, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    
    return frame

# Function to process the video and display annotated output with threat detection
def process_video_display(input_video_path, model_id="women-safety-hjfzs/1", frame_skip=5):
    # Open video file
    video = cv2.VideoCapture(input_video_path)
    
    frame_count = 0
    processed_frame_count = 0
    while video.isOpened():
        ret, frame = video.read()
        if not ret:
            break
        
        frame_count += 1
        
        # Skip frames based on the frame_skip parameter
        if frame_count % frame_skip != 0:
            continue
        
        processed_frame_count += 1
        print(f"Processing frame {frame_count} (processed frame count: {processed_frame_count})")
        
        # Save frame temporarily to perform inference
        temp_image_path = 'temp_frame.jpg'
        cv2.imwrite(temp_image_path, frame)
        
        # Perform inference on the frame
        result = CLIENT.infer(temp_image_path, model_id=model_id)
        detections = result['predictions']
        
        # Get current time for night-time check
        current_time = datetime.now()
        
        # Annotate frame with detections and check for threats
        annotated_frame = annotate_frame(frame, detections, current_time)
        
        # Display the annotated frame
        cv2.imshow('Threat Detection', annotated_frame)
        
        # Break loop if 'q' key is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    # Release the video object and close display window
    video.release()
    cv2.destroyAllWindows()

# Use the function to process a video and display annotated frames
input_video_path = 'data/nonViolence.mp4'

# Process only every 5th frame
process_video_display(input_video_path, frame_skip=5)


