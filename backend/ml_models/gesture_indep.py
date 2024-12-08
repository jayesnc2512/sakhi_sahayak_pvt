import cv2
import mediapipe as mp
import time

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

# Function to check if the detected hand is an open palm
def is_open_palm(hand_landmarks):
    thumb_tip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP]
    index_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
    pinky_tip = hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_TIP]
    wrist = hand_landmarks.landmark[mp_hands.HandLandmark.WRIST]

    thumb_wrist_distance = ((thumb_tip.x - wrist.x) ** 2 + (thumb_tip.y - wrist.y) ** 2) ** 0.5
    index_wrist_distance = ((index_tip.x - wrist.x) ** 2 + (index_tip.y - wrist.y) ** 2) ** 0.5
    pinky_wrist_distance = ((pinky_tip.x - wrist.x) ** 2 + (pinky_tip.y - wrist.y) ** 2) ** 0.5

    if thumb_wrist_distance > 0.3 and index_wrist_distance > 0.3 and pinky_wrist_distance > 0.3:
        return True
    return False

def is_thumb_tucked(hand_landmarks):
    thumb_tip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP]
    thumb_base = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_CMC]
    pinky_base = hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_MCP]

    distance = ((thumb_tip.x - pinky_base.x) ** 2 + (thumb_tip.y - pinky_base.y) ** 2) ** 0.5
    if distance < 0.2:
        return True
    return False

def is_wrist_close_to_fingers(hand_landmarks):
    wrist = hand_landmarks.landmark[mp_hands.HandLandmark.WRIST]
    index_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
    pinky_tip = hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_TIP]

    wrist_to_index_tip_distance = ((wrist.x - index_tip.x) ** 2 + (wrist.y - index_tip.y) ** 2) ** 0.5
    wrist_to_pinky_tip_distance = ((wrist.x - pinky_tip.x) ** 2 + (wrist.y - pinky_tip.y) ** 2) ** 0.5

    if wrist_to_index_tip_distance < 0.2 or wrist_to_pinky_tip_distance < 0.2:
        return True
    return False

# OpenCV Video Capture
cap = cv2.VideoCapture(0)

# Define a state to track the sequence of gestures
gesture_sequence = ['Open Palm', 'Thumb Tucked', 'Wrist Formed']
current_state = 0  # Start with Open Palm gesture detection

# Time tracking for the 2 seconds rule
thumb_tucked_time = None

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("Failed to capture frame. Exiting...")
        break

    # Convert the frame to RGB as MediaPipe processes RGB images
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(frame_rgb)

    # Check for hand landmarks
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            # Draw hand landmarks
            mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            # Check for gestures based on the current state
            if current_state == 0:  # Looking for open palm
                if is_open_palm(hand_landmarks):
                    print("Open Palm Detected")
                    cv2.putText(frame, "Open Palm Detected", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    current_state = 1  # Move to thumb tucked detection

            elif current_state == 1:  # Looking for thumb tucked
                if is_thumb_tucked(hand_landmarks):
                    print("Thumb Tucked Detected")
                    cv2.putText(frame, "Thumb Tucked Detected", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    current_state = 2  # Move to wrist formed detection
                    thumb_tucked_time = time.time()  # Start the timer when thumb is tucked

            elif current_state == 2:  # Looking for wrist formed
                if is_wrist_close_to_fingers(hand_landmarks):
                    print("Wrist Formed Detected")
                    cv2.putText(frame, "Wrist Formed Detected", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    print("Alert: Silent Signal Gesture Completed!")
                    current_state = 0  # Reset to start again

                else:
                    if time.time() - thumb_tucked_time > 2:  # If more than 2 seconds have passed since thumb tucked
                        print("Timeout: Wrist not formed in time. Resetting.")
                        current_state = 1  # Reset to thumb tucked detection

    # Display the result
    cv2.imshow("Gesture Sequence Recognition", frame)

    # Exit with the 'q' key
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release resources
cap.release()
cv2.destroyAllWindows()
