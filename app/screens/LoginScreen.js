import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sakhi Sahayak</Text>
      <Text style={styles.welcome}>Welcome to Sakhi Sahayak</Text>
      <View style={styles.tab}>
        <TouchableOpacity style={[styles.tabButton, styles.activeTab]}>
          <Text style={styles.tabText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tabText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
      <TextInput placeholder="Email Address" style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} />
      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>
      <Text style={styles.orText}>or Login with</Text>
      <View style={styles.socialIcons}>
        <Image source={require('../assets/google-icon.png')} style={styles.icon} />
        <Image source={require('../assets/apple-icon.png')} style={styles.icon} />
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#F3E8FF', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#9150E4', marginTop: 50 },
  welcome: { fontSize: 18, color: '#444', marginVertical: 20 },
  tab: { flexDirection: 'row', marginBottom: 20 },
  tabButton: { flex: 1, padding: 10, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#9150E4' },
  tabText: { fontSize: 16, color: '#9150E4' },
  input: { width: '100%', borderWidth: 1, borderColor: '#CCC', borderRadius: 10, padding: 10, marginVertical: 10 },
  forgotPassword: { color: '#9150E4', marginTop: 10 },
  orText: { marginVertical: 10 },
  socialIcons: { flexDirection: 'row', justifyContent: 'space-between', width: '50%' },
  icon: { width: 40, height: 40 },
  loginButton: { marginTop: 20, backgroundColor: '#9150E4', padding: 15, borderRadius: 10 },
  loginText: { color: '#FFF', fontSize: 16, textAlign: 'center' },
});
