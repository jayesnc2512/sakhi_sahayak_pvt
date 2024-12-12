import cv2
import numpy as np

class night:
    def classify_day_night(image):
        # Convert the image to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Calculate the average brightness
        avg_brightness = np.mean(gray)
        
        # Define a threshold for day and night
        brightness_threshold = 80  # Adjust this value based on your use case
        
        if avg_brightness > brightness_threshold:
            return "Day"
        else:
            return "Night"
