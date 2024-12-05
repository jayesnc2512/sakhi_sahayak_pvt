import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';


export default function HomeScreen({navigation}) {

  const handleGetStarted = async () => {
    setTimeout(()=>{
      navigation.navigate('Login');
    }, 200);
  }


  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Image source={require('../assets/appLogo.png')} style={styles.logo} />
        <Text style={styles.title}>Sakhi Sahayak</Text>
      </View>
      <Image source={require('../assets/protecting-women.png')} style={styles.image} />
      <Text style={styles.subtitle}>Protecting Women from Safety Threats</Text>
      <Text style={styles.description}>
        An AI-driven system ensuring women's safety through real-time threat detection and timely alerts, fostering secure and inclusive urban spaces.
      </Text>
      <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#E6E6FA',
    padding: 30
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:45
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 14,
  },
  title: {
    fontSize: 28,
    color: '#9150E4',
    fontFamily: 'Pacifico', 
  },
  image: {
    width: 274,
    height: 278,
    marginVertical: 23,
  },
  subtitle: {
    fontSize: 24,
    color: '#444',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily:'PoppinsBold'
  },
  description: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily:'PoppinsRegular'
  },
  getStartedButton: {
    backgroundColor: '#9150E4',
    padding: 12,
    width: 170,
    borderRadius: 20,
  },
  getStartedText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    fontFamily:'PoppinsRegular'
  },
});
