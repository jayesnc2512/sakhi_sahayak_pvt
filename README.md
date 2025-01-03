# Sakhi Sahayak: Protecting Women from Safety Threats

Sakhi Sahayak is an AI-powered mobile application designed to enhance women's safety by providing real-time threat detection, timely alerts, and easy access to emergency services.  It leverages advanced technologies like machine learning, computer vision, and location services to create a safer environment for women in urban spaces.

![SMART INDIA HACKATHON 2024 SakhiSahayak](https://github.com/user-attachments/assets/0b1d3123-cecd-45ea-9ae9-6ea0ac782f3c)

## Key Features

* **Real-time Threat Detection:**  Utilizes AI models for gender classification, gesture recognition (SOS signals), and gender ratio analysis to identify potential threats.
* **Hotspot Mapping:** Identifies high-risk areas based on historical incident data and alerts users when they enter such zones.
* **Emergency SOS:**  One-touch SOS button triggers calls, SMS alerts to emergency contacts, and notifies local law enforcement (integrated with 112).
* **Nearby Police Stations and Hospitals:** Provides quick access to contact information, directions, and navigation to the nearest police stations and medical facilities.
* **Safe Mode:** Enables continuous location tracking, periodic alerts, and automated calls to ensure the user's safety, especially during prolonged inactivity.
* **User-Friendly Interface:**  Easy-to-navigate design with accessibility and robust functionality for optimal user experience.


## System Architecture

The system comprises the following components:

1. **CCTV Network:** Public and private CCTV cameras stream real-time footage to the server.
2. **Server:**  Processes video streams using AI models for threat detection. Manages alerts, location data, and communication with user applications and emergency services.
3. **User Application:** Mobile app providing safety features, real-time alerts, and access to emergency services.
4. **Third-Party Systems:** Integration with 112 emergency services and location services (Google Maps/OpenStreetMap).

![System Architecture Diagram](https://github.com/user-attachments/assets/64cd8cad-7929-42d5-b5d3-bb902c90fe22)



## AI Models

* **Gender Classification:** YOLOv8 model trained on 2686 images with data augmentation. Achieves 86.5% mAP.
* **Gesture Recognition:** Uses MediaPipe to detect SOS gestures (open hand, tucked thumb, closed fist) in real-time.
* **Gender Ratio Analysis:**  Calculates the ratio of men to women in a given area to identify potential risk situations.
* **Hotspot Mapping:** Employs DBSCAN clustering algorithm to identify areas with frequent incidents.
* **Day/Night Detection:** Utilizes OpenCV for ambient light analysis to enhance model accuracy in different lighting conditions.

<img src="https://github.com/user-attachments/assets/f0d42c9f-4f1b-419c-bde3-c3f5bf771fd9" alt="5" width="300" height="200" />
<img src="https://github.com/user-attachments/assets/1a285dce-8610-4c50-b2fd-9af6c7ee98ed" alt="1" width="300" height="200" />
<img src="https://github.com/user-attachments/assets/47d70bb3-6ddd-4111-a2ee-813b85ad9d06" alt="8" width="300" height="200" />
<img src="https://github.com/user-attachments/assets/b58c6041-4612-41b7-ab3f-7a0c2d5ef030" alt="7" width="300" height="200" />
<img src="https://github.com/user-attachments/assets/ed07cf40-d8d7-4218-8495-c89fc3897f3f" alt="6" width="300" height="200" />

## User Flow

![User Flow Chart](https://github.com/user-attachments/assets/57911989-ac48-411b-970b-5267a3eaddad)


## Technology Stack

* **Backend:** FastAPI, Python, Twilio (for communication), WebSocket, Kafka, Supabase (Database)
* **Frontend:** React, JavaScript
* **AI/ML:** YOLOv8, MediaPipe, OpenCV, DBSCAN
* **Cloud:** AWS S3 (for storage)


## Team

* Tejashree Bhangale
* Jayesh Chaudhari
* Savio Dias
* Devashish Jawale
* Harsh Khairnaar
* Suhani Bhuti

## Problem Statement

SIH1605: Women Safety Analytics - Protecting women from safety threats.

## Team ID

226

## Team Name

Team Boka

## PPT 
[SIH Finale PPT](https://www.canva.com/design/DAGY9b5aUiQ/aK7NY4p6BRfNOsBrA1I6CA/edit?utm_content=DAGY9b5aUiQ&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)
[SIH PreFinale PPT](https://www.canva.com/design/DAGP9TUyyrw/_Q-X3ZvvuQ3u_qgGWg6DLw/edit?utm_content=DAGP9TUyyrw&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

## Youtube Link
[SakhiSahayak](https://www.youtube.com/watch?v=3Auo9-Z80mw)








