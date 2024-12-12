import cv2
import mediapipe as mp
import time

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

class GestureRecognizer:
    def __init__(self):
        self.current_state = 0
        self.thumb_tucked_time = None
        self.gesture_sequence = ['Open Palm', 'Thumb Tucked', 'Wrist Formed']

    def is_open_palm(self, hand_landmarks):
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

    def is_thumb_tucked(self, hand_landmarks):
        thumb_tip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP]
        thumb_base = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_CMC]
        pinky_base = hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_MCP]

        distance = ((thumb_tip.x - pinky_base.x) ** 2 + (thumb_tip.y - pinky_base.y) ** 2) ** 0.5
        if distance < 0.2:
            return True
        return False

    def is_wrist_close_to_fingers(self, hand_landmarks):
        wrist = hand_landmarks.landmark[mp_hands.HandLandmark.WRIST]
        index_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
        pinky_tip = hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_TIP]

        wrist_to_index_tip_distance = ((wrist.x - index_tip.x) ** 2 + (wrist.y - index_tip.y) ** 2) ** 0.5
        wrist_to_pinky_tip_distance = ((wrist.x - pinky_tip.x) ** 2 + (wrist.y - pinky_tip.y) ** 2) ** 0.5

        if wrist_to_index_tip_distance < 0.2 or wrist_to_pinky_tip_distance < 0.2:
            return True
        return False

    def process_frame_gesture1(self, frame):
        # Convert the frame to RGB as MediaPipe processes RGB images
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(frame_rgb)
        inference_result = []
        processed_frame = frame.copy()

        # Check for hand landmarks
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Draw hand landmarks
                mp_drawing.draw_landmarks(processed_frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

                # Check for gestures based on the current state
                if self.current_state == 0:  # Looking for open palm
                    if self.is_open_palm(hand_landmarks):
                        inference_result.append("Open Palm Detected")
                        print("current_state", self.current_state)
                        self.current_state = 1  # Move to thumb tucked detection

                elif self.current_state == 1:  # Looking for thumb tucked
                    if self.is_thumb_tucked(hand_landmarks):
                        inference_result.append("Thumb Tucked Detected")
                        print("current_state", self.current_state)
                        self.current_state = 2  # Move to wrist formed detection
                        self.thumb_tucked_time = time.time()  # Start the timer when thumb is tucked

                elif self.current_state == 2:  # Looking for wrist formed
                    if self.is_wrist_close_to_fingers(hand_landmarks):
                        inference_result.append("Wrist Formed Detected")
                        print("current_state", self.current_state)
                        inference_result.append("Alert: Silent Signal Gesture Completed!")
                        self.current_state = 0  # Reset to start again

                    else:
                        if time.time() - self.thumb_tucked_time > 20:  # If more than 2 seconds have passed since thumb tucked
                            inference_result.append("Timeout: Wrist not formed in time. Resetting.")
                            self.current_state = 1  # Reset to thumb tucked detection
        return inference_result, processed_frame

# Example usage
# cap = cv2.VideoCapture(0)
# gesture_recognizer = GestureRecognizer()

# while cap.isOpened():
#     ret, frame = cap.read()
#     if not ret:
#         print("Failed to capture frame. Exiting...")
#         break

#     inference_result, processed_frame = gesture_recognizer.process_frame_gesture1(frame)
#     cv2.imshow("Gesture Sequence Recognition", processed_frame)

#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# cap.release()
# cv2.destroyAllWindows()