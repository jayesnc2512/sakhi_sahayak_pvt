import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system'; 
import { useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import * as Location from 'expo-location';
export default function SOSNotify() {
  const navigation = useNavigation();
  const hasCalled = useRef(false); // Ensure API calls happen only once
  const locationRef = useRef(null);
  const sharedOpacities = Array.from({ length: 4 }, () => useSharedValue(0));
  const [apiCalled, setApiCalled] = useState(false);

  const sendEmergencySMS = async (location) => {
    try {
      console.log('location', location);
      const response = await fetch('https://7339-2409-40c0-1070-6544-493e-44a9-e6a0-1259.ngrok-free.app/tw/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `This is an emergency alert! Guest user is in danger. location during danger: ${location.lat}, ${location.lng}`,
          phone_numbers: ["+918104782543", "+919067374010"],
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Emergency SMS sent successfully:', data);
        return true;
      } else {
        console.error('Failed to send SMS:', data);
        return false;
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  };

  // Make a POST request to initiate SOS calls
  const initiateSOSCalls = async () => {
    try {
      const response = await fetch('https://7339-2409-40c0-1070-6544-493e-44a9-e6a0-1259.ngrok-free.app/tw/call-emergency-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priority: 'high',
          phone_numbers: ["+918104782543", "+919067374010"], 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('SOS calls initiated successfully:', data);
        return true;
      } else {
        console.error('Failed to initiate SOS calls:', data);
        return false;
      }
    } catch (error) {
      console.error('Error initiating SOS calls:', error);
      return false;
    }
  };

  const fetchLocation = async () => {
    try {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
  
      if (locationStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Location permissions are needed for Safe Mode.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }
  
      // Use getCurrentPositionAsync for a one-time location fetch
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High, // Set the accuracy you want
      });
  
      if (location && location.coords) {
        console.log('Current location:', location.coords);
        locationRef.current = location.coords; // Save location in ref
        return {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };
      } else {
        console.warn('Location update received, but no coordinates');
      }
    } catch (e) {
      console.log('Error in fetching current location', e);
    }
  };

  useEffect(() => {
    const callAPI = async () => {
      if (!hasCalled.current && !apiCalled) {
        hasCalled.current = true;
        setApiCalled(true); 

        const location = await fetchLocation();
        if (location) {
          console.log('calling sms and call functions')
          const smsSent = await sendEmergencySMS(location);
          const sosCallsInitiated = await initiateSOSCalls();

          if (smsSent && sosCallsInitiated) {
            setTimeout(() => {
              navigation.navigate('Dash'); 
            }, 200);
          }
        }
      }
    };

    callAPI(); 
  }, []); 

  const handleCancelSOS = async () => {
    setTimeout(() => {
      navigation.navigate('Dash');  
    }, 200);
  };

  const animatedCircleStyles = sharedOpacities.map((opacity) =>
    useAnimatedStyle(() => ({
      opacity: opacity.value,
    }))
  );

  useEffect(()=>{
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

  }, []);

 

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
