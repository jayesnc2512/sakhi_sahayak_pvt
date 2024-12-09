import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

const ProfilePage = () => {
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image 
          source={require('../assets/profilePic.png')} 
          style={styles.profileImage} 
        />
        <Text style={styles.name}>Sara Jones</Text>
        <Text style={styles.location}>Mumbai, India</Text>
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
        Hi there! My name is Sara, and safety is my top priority. This app is my trusted companion, guiding me through the safest routes wherever I go. It’s designed to alert my loved ones instantly in case of emergencies with its SOS feature. Whether I'm navigating the city or reaching out for help, I feel more confident and secure knowing this app has my back. Together, we’re making every step safer!</Text>
      </View>

      {/* Contact Info Section */}
      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Contact Info</Text>
        <Text style={styles.contactText}>Email: sara.jones@example.com</Text>
        <Text style={styles.contactText}>Phone: +91 98765 43210</Text>
      </View>

      {/* Alerts Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alerts</Text>
        <View style={styles.optionsContainer}>
          <View style={styles.option}>
            <Text style={styles.optionText}>Audio</Text>
          </View>
          <View style={styles.option}>
            <Text style={styles.optionText}>Video</Text>
          </View>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 50,
    padding: 20,
    backgroundColor: '#AB90CE',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 16,
    color: '#666',
  },
  aboutSection: {
    margin: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  aboutText: {
    fontSize: 16,
    color: '#333',
  },
  contactSection: {
    margin: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  section: {
    margin: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
  },
  routeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  routeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sosButton: {
    backgroundColor: '#FF5722',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfilePage;
