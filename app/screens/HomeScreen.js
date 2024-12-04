import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sakhi Sahayak</Text>
      <Image source={require('../assets/protecting-women.png')} style={styles.image} />
      <Text style={styles.subtitle}>Protecting Women from Safety Threats</Text>
      <Text style={styles.description}>
        An AI-driven system ensuring women's safety through real-time threat detection and timely alerts, fostering secure and inclusive urban spaces.
      </Text>
      <TouchableOpacity style={styles.getStartedButton}>
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#F3E8FF', padding: 50 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#9150E4', marginVertical: 20 },
  image: { width: 200, height: 200, marginVertical: 20 },
  subtitle: { fontSize: 20, fontWeight: 'bold', color: '#444', marginBottom: 10 },
  description: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },
  getStartedButton: { backgroundColor: '#9150E4', padding: 15, borderRadius: 10 },
  getStartedText: { color: '#FFF', fontSize: 16, textAlign: 'center' },
});
