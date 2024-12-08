
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

const ProfilePage = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://placekitten.com/200/200' }} 
          style={styles.profileImage} 
        />
        <Text style={styles.name}>Sara Jones</Text>
        <Text style={styles.location}>Mumbai, India</Text>
      </View>

      <View style={styles.alertsContainer}>
        <View style={styles.alert}>
          <Text style={styles.alertText}>Orange Alert</Text>
        </View>
        <View style={styles.alert}>
          <Text style={styles.alertText}>Red Alert</Text>
        </View>
      </View>

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recorder</Text>
        <View style={styles.optionsContainer}>
          <View style={styles.option}>
            <Text style={styles.optionText}>1 minute</Text>
          </View>
          <View style={styles.option}>
            <Text style={styles.optionText}>5 minutes</Text>
          </View>
          <View style={styles.option}>
            <Text style={styles.optionText}>10 minutes</Text>
          </View>
          <View style={styles.option}>
            <Text style={styles.optionText}>Set Time</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fake Caller</Text> <View style={styles.optionsContainer}>
          <View style={styles.option}>
            <Text style={styles.optionText}>Call Now</Text>
          </View>
          <View style={styles.option}>
            <Text style={styles.optionText}>Schedule Call</Text>
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
  alertsContainer: {
    padding: 20,

    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  alert: {
    margin: 5,
    backgroundColor: '#ffcc00',
    padding: 10,
    borderRadius: 5,
  },
  alertText: {
    color: '#fff',
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
});

export default ProfilePage;