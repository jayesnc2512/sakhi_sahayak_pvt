import React, { useState, useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import Dashboard from './screens/Dashboard';
import SOSNotify from './screens/DashScreen/SOSNotify';
import SafeMode from './screens/DashScreen/SafeMode';
import MapScreen from './screens/DashScreen/mapScreen';
import NavigationProfile from './screens/NavigationProfile';
import Profile from './screens/profile';
import Contact from './screens/Contacts';
import Police from './screens/Police';
import Hospital from './screens/Hospital';
import { Vibration } from 'react-native';
import * as Location from 'expo-location'; 
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
const Stack = createStackNavigator();

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });  

// async function registerForPushNotificationsAsync() {
//   let token;
//   console.log("Registering for push notifications...");

//   if (Platform.OS === 'android') {
//     console.log("Setting notification channel for Android...");
//     await Notifications.setNotificationChannelAsync('default', {
//       name: 'default',
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: '#FF231F7C',
//     });
//   }

//   if (Device.isDevice) {
//     console.log("Checking notification permissions...");
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     console.log("Existing status:", existingStatus);

//     let finalStatus = existingStatus;
//     if (existingStatus !== 'granted') {
//       console.log("Requesting notification permissions...");
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//       console.log("Final status:", finalStatus);
//     }

//     if (finalStatus !== 'granted') {
//       alert('Failed to get push token for push notification!');
//       return;
//     }

//     try {
//       console.log("Fetching Expo push token...");
//       token = (await Notifications.getExpoPushTokenAsync()).data;
//       console.log("Expo push token:", token);
//     } catch (error) {
//       console.error("Error fetching push token:", error);
//     }
//   } else {
//     alert('Must use a physical device for Push Notifications');
//   }

//   return token;
// }



// async function sendPushNotification(expoPushToken, title, body) {
//   const message = {
//     to: expoPushToken,
//     sound: 'default',
//     title,
//     body,
//     data: { someData: 'Vibration event triggered' },
//   };

//   await fetch('https://exp.host/--/api/v2/push/send', {
//     method: 'POST',
//     headers: {
//       'Accept': 'application/json',
//       'Accept-encoding': 'gzip, deflate',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(message),
//   });
// }


export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [location, setLocation] = useState(null);
  const [isConnected, setIsConnected] = useState(false);  
  

  const loadFonts = async () => {
    await Font.loadAsync({
      Pacifico: require('./assets/fonts/Pacifico-Regular.ttf'),
      PoppinsRegular: require('./assets/fonts/Poppins-Regular.ttf'),
      PoppinsBold: require('./assets/fonts/Poppins-Bold.ttf'),
      PoppinsSemiBold: require('./assets/fonts/Poppins-SemiBold.ttf'),
      PoppinsMedium: require('./assets/fonts/Poppins-Medium.ttf')
    });
  };

  if (!fontsLoaded) {
    return (
      <AppLoading
        startAsync={loadFonts}
        onFinish={() => setFontsLoaded(true)}
        onError={console.warn}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Dash" component={Dashboard} />
        <Stack.Screen name="NavP" component={NavigationProfile} />
        <Stack.Screen name="Profile" component={Profile}/>
        <Stack.Screen name="Contacts" component={Contact} />
        <Stack.Screen name="Police" component={Police} />
        <Stack.Screen name="Hospital" component={Hospital} />
        <Stack.Screen name="SOSN" component={SOSNotify} 
          options={{
            cardStyleInterpolator: ({ current, next, layouts }) => {
                return {
                    cardStyle: {
                        transform: [
                            {
                                translateY: current.progress.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [layouts.screen.height, 0], 
                                }),
                            },
                        ],
                    },
                    overlayStyle: {
                        opacity: next
                            ? next.progress.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.5, 0], 
                              })
                            : current.progress.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, 0.5], 
                              }),
                    },
                };
            },
        }} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="SafeMode" component={SafeMode}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
