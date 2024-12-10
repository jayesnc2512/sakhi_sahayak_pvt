import cv2

# Replace with your RTSP link
rtsp_url = "rtsp://192.168.1.8:8080/h264.sdp"

# Open the video stream
cap = cv2.VideoCapture(rtsp_url)

if not cap.isOpened():
    print("Error: Couldn't open RTSP stream.")
    exit()

while True:
    # Read a frame from the RTSP stream
    ret, frame = cap.read()

    if not ret:
        print("Error: Couldn't read frame.")
        break

    # Display the frame
    cv2.imshow('RTSP Stream', frame)

    # Wait for 1 ms and check if the user pressed 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the video stream and close the window
cap.release()
cv2.destroyAllWindows()
