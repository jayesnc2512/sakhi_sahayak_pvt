import cv2
import mediapipe as mp

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.5)
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

    return thumb_wrist_distance > 0.3 and index_wrist_distance > 0.3 and pinky_wrist_distance > 0.3

# Function to check if the detected hand is a closed fist
def is_closed_fist(hand_landmarks):
    index_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
    index_mcp = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_MCP]
    thumb_tip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP]

    index_distance = ((index_tip.x - index_mcp.x) ** 2 + (index_tip.y - index_mcp.y) ** 2) ** 0.5
    thumb_distance = ((thumb_tip.x - index_mcp.x) ** 2 + (thumb_tip.y - index_mcp.y) ** 2) ** 0.5

    return index_distance < 0.1 and thumb_distance < 0.1

# Function to process a single frame
def process_frame(frame):
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(frame_rgb)

    inference_result = []
    processed_frame = frame.copy()

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(
                processed_frame, hand_landmarks, mp_hands.HAND_CONNECTIONS
            )

            if is_open_palm(hand_landmarks):
                inference_result.append("Open Palm Detected")
            elif is_closed_fist(hand_landmarks):
                inference_result.append("Closed Fist Detected")
            else:
                inference_result.append("Unknown Gesture")

    return inference_result, processed_frame
