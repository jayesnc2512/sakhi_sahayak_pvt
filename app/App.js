import React, { useState } from 'react';
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
const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  
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
}}
    />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="SafeMode" component={SafeMode}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}



