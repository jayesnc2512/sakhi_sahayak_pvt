import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const handleLogin = async () => {
    setTimeout(()=>{
      navigation.navigate('Map');
    }, 200);
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Image source={require('../assets/appLogo.png')} style={styles.logo} />
        <Text style={styles.title}>Sakhi Sahayak</Text>
      </View>

      <Text style={styles.welcome}>Welcome to Sakhi Sahayak</Text>
      
 
      <View style={styles.tab}>
        <TouchableOpacity
          style={[styles.tabButton, isLogin && styles.activeTabButton]}
          onPress={() => setIsLogin(true)} 
        >
          <Text style={styles.tabText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, !isLogin && styles.activeTabButton]}
          onPress={() => setIsLogin(false)}
        >
          <Text style={styles.tabText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

 
      {isLogin ? (
        <View style={styles.formContainer}>
          <TextInput placeholder="Email Address" style={styles.input} placeholderTextColor="rgba(0,0,0,0.4)" />
          <TextInput placeholder="Password" secureTextEntry style={styles.input} placeholderTextColor="rgba(0,0,0,0.4)"/>
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
          <View style={styles.orTextContainer}>
            <View style={styles.orTextSideLines}></View>
           
            <Text style={styles.orText}>or Login with</Text>
       
            <View style={styles.orTextSideLines}></View>
          </View>
          <View style={styles.socialIcons}>
          <TouchableOpacity style={styles.iconButton}>
              <Image source={require('../assets/google-icon.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Image source={require('../assets/apple-icon.png')} style={styles.icon} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Map')}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <TextInput placeholder="Email Address or Phone Number" style={styles.input} placeholderTextColor="rgba(0,0,0,0.4)"/>
          <TextInput placeholder="Password" secureTextEntry style={styles.input} placeholderTextColor="rgba(0,0,0,0.4)"/>
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
          <View style={styles.orTextContainer}>
            <View style={styles.orTextSideLines}></View>
       
            <Text style={styles.orText}>or SignUp with</Text>
           
            <View style={styles.orTextSideLines}></View>
          </View>
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Image source={require('../assets/google-icon.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Image source={require('../assets/apple-icon.png')} style={styles.icon} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Map')}>
            <Text style={styles.loginText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#E6E6FA', padding: 33 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 45 },
  logo: { width: 60, height: 60, marginRight: 14 },
  title: { fontSize: 28, color: '#9150E4', fontFamily: 'Pacifico' },
  welcome: { fontSize: 20, color: '#444', marginVertical: 15, fontFamily: 'PoppinsSemiBold' },
  

  tab: { flexDirection: 'row', marginBottom: 20, backgroundColor: 'rgba(145, 80, 228, 0.5)', borderRadius: 20, height: 60, alignItems: 'center' },
  tabButton: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 18, marginHorizontal: 7 },
  activeTabButton: { backgroundColor: 'white' }, // Active tab button color change
  tabText: { fontSize: 16, color: '#000000', fontFamily: 'PoppinsSemiBold' },


  formContainer: { width: '100%', flex:1, alignItems:'center'  },
  input: { 
    width: '100%', 
    borderWidth: 2,
    borderColor: '#CCC', 
    borderRadius: 10, 
    padding: 10, 
    marginVertical: 10, 
    height: 55,
    fontFamily: 'PoppinsRegular', 
    color:'rgba(0,0,0,0.6)'
  },
  
  forgotPassword: { color: '#9150E4', marginTop: 10, textAlign:'right' , fontFamily:'PoppinsRegular', marginBottom: 20},
  
  orTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    maringTop: 10
  },
  
  orText: {
    marginVertical: 10,
    flexDirection: 'row',
    textAlign: 'center',
    justifyContent: 'center',
    fontSize:16,
    fontFamily:'PoppinsMedium' 
  },
  
  orTextSideLines: {
    height: 2,
    width: 100,
    backgroundColor: 'rgba(0,0,0,1)',
    marginHorizontal: 7,
  },
  


  socialIcons: { flexDirection: 'row', justifyContent: 'center', width: '100%' , marginVertical:10, gap:25},
  icon: { width: 40, height: 40 },
  iconButton: {borderColor:'rgba(0,0,0,0.25)', borderWidth: 2, width: '50%', padding: 7, alignItems: 'center', justifyContent: 'center', borderRadius: 15},
  

  loginButton: { marginTop: 15, backgroundColor: '#9150E4', padding: 10, borderRadius: 10, width:220 },
  loginText: { color: '#FFFFFF', fontSize: 20, textAlign: 'center', fontFamily:'PoppinsSemiBold' },
});
