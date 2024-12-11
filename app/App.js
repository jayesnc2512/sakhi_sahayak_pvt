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
  // const wsRef = useRef(null);
  // const [expoPushToken, setExpoPushToken] = useState('');
  // const [notification, setNotification] = useState(false);
  // const [title, setTitle] = useState('');
  // const [body, setBody] = useState('');
  

  // const notificationListener = useRef();
  // const responseListener = useRef();


  // useEffect(() => {
  //   console.log("Calling registerForPushNotificationsAsync...");
  // registerForPushNotificationsAsync().then((token) => {
  //   console.log("Received token:", token);
  //   setExpoPushToken(token);
  // });

  //   notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
  //     setNotification(notification);
  //   });

  //   responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
  //     console.log(response);
  //   });

  //   return () => {
  //     Notifications.removeNotificationSubscription(notificationListener.current);
  //     Notifications.removeNotificationSubscription(responseListener.current);
  //   };
  // }, []);

  // useEffect(() => {
  //   const requestPermissions = async () => {
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== 'granted') {
  //       alert('Permission to access location was denied');
  //       return;
  //     }
  //   };

  //   // Request permission on app load
  //   requestPermissions();

  //   // Establish WebSocket connection when the app starts
  //   const setupWebSocket = () => {
  //     wsRef.current = new WebSocket('ws://7339-2409-40c0-1070-6544-493e-44a9-e6a0-1259.ngrok-free.app/ws/hotspotDetection'); // Replace with your actual backend URL

  //     wsRef.current.onopen = () => {
  //       console.log('WebSocket connection established');
  //       setIsConnected(true); // Update connection state
  //     };

  //     wsRef.current.onmessage = async (event) => {
  //       const data = JSON.parse(event.data);
  //       if (data.vibrate) {
  //         console.log('inside vibration if')
  //         // Vibrate the phone for 5 seconds
  //         Vibration.vibrate(3000);
  //         if (expoPushToken) {
  //           console.log('inside push notification')
  //           await sendPushNotification(
  //             expoPushToken,
  //             'Safety Alert',
  //             'A vibration event has been detected!'
  //           );
  //         }
       
  //       }
  //     };

  //     wsRef.current.onerror = (error) => {
  //       console.error('WebSocket error:', error);
  //     };

  //     wsRef.current.onclose = () => {
  //       console.log('WebSocket connection closed');
  //       setIsConnected(false); // Reset connection state
  //     };
  //   };

  //   // Set up WebSocket connection
  //   setupWebSocket();

  //   // Watch for location updates
  //   const locationWatcher = Location.watchPositionAsync(
  //     {
  //       accuracy: Location.Accuracy.High,
  //       timeInterval: 1000,
  //     },
  //     (newLocation) => {
  //       setLocation(newLocation);
  //     }
  //   );

  //   // Cleanup function
  //   return () => {
  //     if (wsRef.current) {
  //       wsRef.current.close();
  //     }
  //     if (locationWatcher) {
  //       locationWatcher.remove();
  //     }
  //   };
  // }, []); 

  // useEffect(() => {
  //   // Ensure WebSocket is open and location is available before sending data
  //   if (location && isConnected) {
  //     console.log('if condition satisfied');
  //     const locationData = {
  //       latitude: location.coords.latitude,
  //       longitude: location.coords.longitude,
  //     };
  
  //     // Log the location data
  //     console.log('Location Data:', locationData);
  
  //     // Send location immediately and on interval
  //     const sendLocationData = () => {
  //       console.log('WebSocket readyState:', wsRef.current.readyState); // Log readyState
  //       if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
  //         console.log('Sending location:', locationData);
  //         wsRef.current.send(JSON.stringify(locationData)); // Send JSON data
  //       } else {
  //         console.log('WebSocket is not open.');
  //       }
  //     };
  
  //     sendLocationData(); // Send initially when location is updated
  
  //     const intervalId = setInterval(() => {
  //       sendLocationData(); // Send every 10 seconds
  //     }, 10000); // 10 seconds
  
  //     // Cleanup interval on unmount or WebSocket close
  //     return () => clearInterval(intervalId);
  //   }
  // }, [location, isConnected]);// Ensure WebSocket is connected and location data is available

  // useEffect(() => {
  //   const requestPermissions = async () => {
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== 'granted') {
  //       alert('Permission to access location was denied');
  //       return;
  //     }
  //   };
  
  //   // Request permission on app load
  //   requestPermissions();
  
  //   // Establish WebSocket connection when the app starts
  //   const setupWebSocket = () => {
  //     wsRef.current = new WebSocket('ws://7339-2409-40c0-1070-6544-493e-44a9-e6a0-1259.ngrok-free.app/ws/hotspotDetection'); // Replace with your actual backend URL
  
  //     wsRef.current.onopen = () => {
  //       console.log('WebSocket connection established');
  //       setIsConnected(true); // Update connection state
  //     };
  
  //     wsRef.current.onmessage = async (event) => {
  //       const data = JSON.parse(event.data);
  //       if (data.vibrate) {
  //         console.log('Vibration detected!');
  
  //         // Vibrate the phone for 3 seconds
  //         Vibration.vibrate(3000);
  
  //         // Send push notification if expoPushToken exists
  //         if (expoPushToken) {
  //           console.log('Sending push notification');
  //           await sendPushNotification(
  //             expoPushToken,
  //             'Safety Alert',
  //             'A vibration event has been detected!'
  //           );
  //         }
  
  //         // Close the WebSocket after vibration
  //         if (wsRef.current) {
  //           console.log('Closing WebSocket after vibration');
  //           wsRef.current.close();
  //         }
  //       }
  //     };
  
  //     wsRef.current.onerror = (error) => {
  //       console.error('WebSocket error:', error);
  //     };
  
  //     wsRef.current.onclose = () => {
  //       console.log('WebSocket connection closed');
  //       setIsConnected(false); // Reset connection state
  //     };
  //   };
  
  //   // Set up WebSocket connection
  //   setupWebSocket();
  
  //   // Watch for location updates
  //   const locationWatcher = Location.watchPositionAsync(
  //     {
  //       accuracy: Location.Accuracy.High,
  //       timeInterval: 1000,
  //     },
  //     (newLocation) => {
  //       setLocation(newLocation);
  //     }
  //   );
  
  //   // Cleanup function
  //   return () => {
  //     if (wsRef.current) {
  //       wsRef.current.close();
  //     }
  //     if (locationWatcher) {
  //       locationWatcher.remove();
  //     }
  //   };
  // }, []); // Empty dependency array, runs on mount only
  
  // useEffect(() => {
  //   // Ensure WebSocket is open and location is available before sending data
  //   if (location && isConnected) {
  //     const locationData = {
  //       latitude: location.coords.latitude,
  //       longitude: location.coords.longitude,
  //     };
  
  //     // Log the location data
  //     console.log('Location Data:', locationData);
  
  //     // Send location immediately and on interval
  //     const sendLocationData = () => {
  //       if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
  //         console.log('Sending location:', locationData);
  //         wsRef.current.send(JSON.stringify(locationData)); // Send JSON data
  //       }
  //     };
  
  //     sendLocationData(); // Send initially when location is updated
  
  //     const intervalId = setInterval(() => {
  //       sendLocationData(); // Send every 10 seconds
  //     }, 10000); // 10 seconds
  
  //     // Cleanup interval on unmount or WebSocket close
  //     return () => clearInterval(intervalId);
  //   }
  // }, [location, isConnected]);
  

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
