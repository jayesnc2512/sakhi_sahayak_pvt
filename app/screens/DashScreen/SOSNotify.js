import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system'; 
import { useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';


let recordingAudio = new Audio.Recording();

export default function SOSNotify() {
  const cameraRef = useRef(null); 
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const navigation = useNavigation();
  const sharedOpacities = Array.from({ length: 4 }, () => useSharedValue(0));

  useEffect(() => {
    const requestPermissions = async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();

      setHasCameraPermission(cameraStatus === 'granted');
      setHasMicrophonePermission(audioStatus === 'granted');
    };

    requestPermissions();

    sharedOpacities.forEach((opacity, index) => {
      opacity.value = withRepeat(
        withTiming(index === 0 ? 1 : 0.8 - index * 0.2, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          delay: index * 3000,
        }),
        -1,
        true
      );
    });

    return () => {
      if (recordingAudio) {
        stopRecordingAudio();
      }
      if (cameraRef.current) {
        stopCameraRecording();
      }
    };
  }, []);

  const animatedCircleStyles = sharedOpacities.map((opacity) =>
    useAnimatedStyle(() => ({
      opacity: opacity.value,
    }))
  );

  const handleCancelSOS = async () => {
    const filepath= await stopRecordingAudio(); 
    await shareFile(filepath);
    await uploadToCloudinary(filepath);
    stopCameraRecording();
    setTimeout(() => {
      navigation.navigate('Dash');  
    }, 200);
  };



const uploadToCloudinary = async (localFileUri) => {
  const CLOUD_NAME = 'dqabgjv3y'; 
  const UPLOAD_PRESET = 'ml_default'; 

  try {
    console.log('in the function of upload to cloudinary')
    // Read file as base64
    const fileBase64 = await FileSystem.readAsStringAsync(localFileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Upload to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: `data:audio/wav;base64,${fileBase64}`, // Ensure the correct MIME type (e.g., audio/wav, audio/mpeg)
        upload_preset: UPLOAD_PRESET,
      }),
    });

    const result = await response.json();
    console.log('result:', result);
    console.log('File uploaded to Cloudinary:', result.secure_url);
    return result.secure_url; 
  } catch (error) {
    console.error('Failed to upload file to Cloudinary:', error);
  }
};


  const startRecordingAudio = async () => {
    if (hasMicrophonePermission && !isRecording) {
      try {
        console.log("Starting audio recording...");
        await recordingAudio.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await recordingAudio.startAsync();
        setIsRecording(true);
        console.log("Audio recording started successfully!");
      } catch (error) {
        console.error('Failed to start audio recording', error);
      }
    }
  };

  const stopRecordingAudio = async () => {
    if (isRecording && recordingAudio) {
      try {
        console.log("Stopping audio recording...");
        await recordingAudio.stopAndUnloadAsync();
        const uri = recordingAudio.getURI();

        const fileName = `audio-${Date.now()}.caf`;
        const filePath = FileSystem.documentDirectory + 'recordings/' + fileName;

        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'recordings/', { intermediates: true });
        await FileSystem.moveAsync({
          from: uri,
          to: filePath,
        });

        setIsRecording(false);
        recordingAudio = null; 
        console.log("Audio recording stopped and saved at", filePath);
        return filePath;
      } catch (error) {
        console.error('Failed to stop audio recording', error);
      }
    }
  };

  const shareFile = async (filePath) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
        console.log('File shared successfully:', filePath);
      } else {
        alert('Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Error sharing file:', error);
    }
  };

  const startCameraRecording = async () => {
    if (hasCameraPermission && hasMicrophonePermission && !isRecording) {
      try {
        console.log("Starting video recording...");
        if (cameraRef.current) {
          const videoRecordPromise = cameraRef.current.recordAsync();
          setIsRecording(true);

          videoRecordPromise.then(async (data) => {
            const videoUri = data.uri;

            const fileName = `video-${Date.now()}.mp4`;
            const filePath = FileSystem.documentDirectory + 'recordings/' + fileName;

            await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'recordings/', { intermediates: true });
            await FileSystem.moveAsync({
              from: videoUri,
              to: filePath,
            });

            console.log("Video recording saved at", filePath);
            setIsRecording(false);
          }).catch((error) => {
            console.error('Failed to record video', error);
            setIsRecording(false);
          });
        }
      } catch (error) {
        console.error('Failed to start video recording', error);
      }
    }
  };

  const stopCameraRecording = async () => {
    if (cameraRef.current && isRecording) {
      try {
        console.log("Stopping video recording...");
        await cameraRef.current.stopRecording();
      } catch (error) {
        console.error('Failed to stop video recording', error);
      }
    }
  };

  useEffect(() => {
    if (hasCameraPermission && hasMicrophonePermission && !isRecording) {
      startRecordingAudio();
      startCameraRecording();  
    }
  }, [hasCameraPermission, hasMicrophonePermission]);

  return (
    <View style={styles.container}>
      <View style={styles.wrapperContainer}>
        <View style={styles.circleWrapper}>
          <View style={[styles.circle, styles.outerCircle]} />

          {animatedCircleStyles.map((animatedStyle, index) => (
            <Animated.View key={index} style={[styles.circle, animatedStyle, styles.innerCircle(index)]} />
          ))}
          <Text style={styles.sosText}>SOS</Text>
        </View>
      </View>
      <Text style={styles.notifyText}>Notifying SOS Contacts</Text>
      <TouchableOpacity style={styles.cancelSOSButton} onPress={handleCancelSOS}>
        <Text style={styles.cancelText}>Cancel SOS</Text>
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
  wrapperContainer: {
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    borderRadius: 135,
    borderWidth: 8,
    borderColor: '#FFF',
  },
  outerCircle: {
    width: 270,
    height: 270,
  },
  innerCircle: (index) => {
    switch (index) {
      case 0:
        return {
          width: 262,
          height: 262,
        };
      case 1:
        return {
          width: 254,
          height: 254,
        };
      case 2:
        return {
          width: 246,
          height: 246,
        };
      default:
        return {};
    }
  },
  sosText: {
    fontSize: 30,
    color: '#FFF',
    textAlign: 'center',
    position: 'absolute',
    fontFamily: 'PoppinsBold',
  },
  notifyText: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'PoppinsSemiBold',
  },
  cancelSOSButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    width: 200,
    borderRadius: 10,
  },
  cancelText: {
    fontSize: 16,
    color: 'white',
    marginRight: 10,
    fontFamily: 'PoppinsSemiBold',
  },
  cancelIcon: {
    width: 30,
    height: 30,
  },
});
