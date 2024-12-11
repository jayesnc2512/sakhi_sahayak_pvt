import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location'; // Import Location module

export default function SafeMode({ navigation }) {
  const webSocketRef = useRef(null);
  const recordingRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const locationRef = useRef(null); // Ref to store the latest location
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleCancelSafe = async () => {
    try {
      // Stop recording interval
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      // Stop current recording
      if (isRecording) {
        await stopRecordingAudio();
      }

      // Close WebSocket
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }

      // Navigate back
      navigation.navigate('Dash');
    } catch (error) {
      console.error('Error in handleCancelSafe:', error);
    }
  };

  const startRecordingAudio = async () => {
    try {
      // Stop any existing recording
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
      }

      // Create new recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
      console.log('Audio recording started successfully!');
    } catch (error) {
      console.error('Failed to start audio recording', error);
      Alert.alert('Recording Error', 'Unable to start audio recording');
    }
  };

  const stopRecordingAudio = async () => {
    if (!recordingRef.current) return null;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      if (!uri) {
        console.log('No audio recorded');
        return null;
      }

      const fileName = `audio-${Date.now()}.caf`;
      const directoryPath = FileSystem.documentDirectory + 'recordings/';
      const filePath = directoryPath + fileName;

      // Ensure directory exists
      await FileSystem.makeDirectoryAsync(directoryPath, { intermediates: true });

      // Move recorded file
      await FileSystem.moveAsync({
        from: uri,
        to: filePath,
      });

      console.log('Audio recording stopped and saved at', filePath);

      // Reset recording state
      recordingRef.current = null;
      setIsRecording(false);

      return filePath;
    } catch (error) {
      console.error('Failed to stop audio recording', error);
      return null;
    }
  };

  const sendAudioAndLocationToBackend = async (filePath) => {
    try {
      // Ensure WebSocket is open
      if (!webSocketRef.current || webSocketRef.current.readyState !== WebSocket.OPEN) {
        console.warn('WebSocket is not open. Unable to send audio and location.');
        return;
      }

      // Ensure location is available before sending
      if (!locationRef.current) {
        console.warn('Location is not available yet.');
        return;
      }

      // Read audio file
      const audioData = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send audio data along with location
      const locationData = {
        lat: locationRef.current.latitude,
        lng: locationRef.current.longitude,
      };

      setTimeout(()=>{
        console.log('waiting to send the file...')
      }, 12000)

      webSocketRef.current.send(
        JSON.stringify({
          type: 'audio_location',
          filename: filePath.split('/').pop(),
          filePath: filePath,
          data: audioData,
          location: locationData,
        })
      );

      console.log('Audio and location sent to backend:', filePath);
    } catch (error) {
      console.error('Error sending audio and location to backend:', error);
    }
  };

  useEffect(() => {
    const setupSafeMode = async () => {
      try {
        // Request permissions for Camera, Microphone, and Location
        const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
        const { status: audioStatus } = await Audio.requestPermissionsAsync();
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

        setHasCameraPermission(cameraStatus === 'granted');
        setHasMicrophonePermission(audioStatus === 'granted');

        // Validate permissions
        if (cameraStatus !== 'granted' || audioStatus !== 'granted' || locationStatus !== 'granted') {
          Alert.alert(
            'Permissions Required',
            'Camera, Microphone, and Location permissions are needed for Safe Mode.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          return;
        }

        // Initialize WebSocket connection
        const ws = new WebSocket('ws://7339-2409-40c0-1070-6544-493e-44a9-e6a0-1259.ngrok-free.app/ws/safemode-analysis');

        ws.onopen = async () => {
          console.log('WebSocket connection established');
          webSocketRef.current = ws;
          setIsConnected(true);

          // Start initial audio recording
          await startRecordingAudio();

          // Set up recording and location interval
          recordingIntervalRef.current = setInterval(async () => {
            try {
              console.log('Stopping and sending recording...');
              const filePath = await stopRecordingAudio();

              if (filePath) {
                await sendAudioAndLocationToBackend(filePath);
              }

              console.log('Restarting recording...');
              await startRecordingAudio();
            } catch (error) {
              console.error('Error in recording cycle:', error);
            }
          }, 10000); // Send every 10 seconds

          // Start location tracking
          Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 10000, // 10 seconds trigger for location updates
            },
            (location) => {
              if (location && location.coords) {
                console.log('Location update received:', location.coords);
                locationRef.current = location.coords; // Save location in ref
              } else {
                console.warn('Location update received, but no coordinates');
              }
            },
            (error) => {
              console.error('Location watching error:', error);
            }
          );
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
          Alert.alert(
            'Connection Error',
            'Unable to establish WebSocket connection.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed');
          setIsConnected(false);

          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
          }
        };
      } catch (error) {
        console.error('Setup error:', error);
        Alert.alert(
          'Initialization Error',
          'Failed to set up Safe Mode.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    };

    setupSafeMode();

    // Cleanup function
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, []);
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.safemodetext}>SAFE MODE IS ON</Text>
      <Text style={styles.safemodetext}>Stay Fearless</Text>
      {isConnected ? (
        <Text style={styles.connectionText}>Connected to backend</Text>
      ) : (
        <Text style={styles.connectionText}>Connecting...</Text>
      )}
      <TouchableOpacity style={styles.cancelSOSButton} onPress={handleCancelSafe}>
        <Text style={styles.cancelText}>Switch Off</Text>
        <Image source={require('../../assets/cancel.png')} style={styles.cancelIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9150E4',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  safemodetext: {
    fontSize: 20,
    marginBottom: 10,
    fontFamily:'PoppinsSemiBold'
  },
  connectionText: {
    marginBottom: 20,
    fontFamily:'PoppinsSemiBold'
  },
  cancelSOSButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    fontFamily:'PoppinsSemiBold'
  },
  cancelText: {
    color: 'white',
    marginRight: 10,
    fontFamily:'PoppinsSemiBold'
  },
  cancelIcon: {
    width: 24,
    height: 24,
  },
});