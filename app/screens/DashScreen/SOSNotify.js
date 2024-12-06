import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

export default function SOSNotify({ navigation }) {


  const sharedOpacities = Array.from({ length: 4 }, () => useSharedValue(0)); 

  React.useEffect(() => {
    
    sharedOpacities.forEach((opacity, index) => {
      opacity.value = withRepeat(
        withTiming(index === 0 ? 1 : 0.8 - index * 0.2, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          delay: index * 3000, 
        }),
        -1, 
        true 
      );
    });
  }, []);


  const animatedCircleStyles = sharedOpacities.map((opacity) =>
    useAnimatedStyle(() => ({
      opacity: opacity.value,
    }))
  );

  const handleCancelSOS = () => {
    setTimeout(() => {
      navigation.navigate('Dash');
    }, 200);
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapperContainer}>
        <View style={styles.circleWrapper}>

          <View style={[styles.circle, styles.outerCircle]} />
  
          {animatedCircleStyles.map((animatedStyle, index) => (
            <Animated.View key={index} style={[styles.circle, animatedStyle, styles.innerCircle(index)]} />
          ))}
          <Text style={styles.sosText}>SOS</Text>
        </View>
      </View>
      <Text style={styles.notifyText}>Notifying SOS Contacts</Text>
      <TouchableOpacity style={styles.cancelSOSButton} onPress={handleCancelSOS}>
        <Text style={styles.cancelText}>Cancel SOS</Text>
        <Image source={require('../../assets/cancel.png')} style={styles.cancelIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9150E4',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  wrapperContainer: {
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    borderRadius: 135,
    borderWidth: 8, 
    borderColor: '#FFF', 
  },
  outerCircle: {
    width: 270,
    height: 270, 
  },
  innerCircle: (index) => {
    switch (index) {
      case 0:
        return {
          width: 262,
          height: 262,
        };
      case 1:
        return {
          width: 254,
          height: 254,
        };
      case 2:
        return {
          width: 246,
          height: 246,
        };
      default:
        return {};
    }
  },
  sosText: {
    fontSize: 30,
    color: '#FFF',
    textAlign: 'center',
    position: 'absolute',
    fontFamily: 'PoppinsBold',
  },
  notifyText: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'PoppinsSemiBold',
  },
  cancelSOSButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    width: 200,
    borderRadius: 10,
  },
  cancelText: {
    fontSize: 16,
    color: 'white',
    marginRight: 10,
    fontFamily: 'PoppinsSemiBold',
  },
  cancelIcon: {
    width: 30,
    height: 30,
  },
});
