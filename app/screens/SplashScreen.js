import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';

export default function SplashScreen({ navigation }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const fadeAnim = new Animated.Value(0);

  // Font loading function
  async function loadFonts() {
    await Font.loadAsync({
      Pacifico: require('../assets/fonts/Pacifico-Regular.ttf'), // Ensure the correct path to the font
    });
    setFontsLoaded(true);
  }

  // Run font loading on component mount
  useEffect(() => {
    loadFonts();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('Login');
      });
    }
  }, [fontsLoaded]);

  // Return loading screen until fonts are loaded
  if (!fontsLoaded) {
    return <AppLoading startAsync={loadFonts} onFinish={() => setFontsLoaded(true)} onError={console.warn} />;
  }

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.logo, { opacity: fadeAnim }]}>
        Sakhi Sahayak
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9150E4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Pacifico', // Use the loaded font here
  },
});
