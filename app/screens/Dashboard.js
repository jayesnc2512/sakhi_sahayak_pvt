import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import * as Progress from 'react-native-progress';

export default function Dashboard ({navigation}){
    const [isProfileInComplete, setProfileComplete] = useState(true);

    const handleClickSOS= () =>{
        setTimeout(()=>{
            navigation.navigate('SOSN');
        }, 300)
    }

    return(
        <View style={styles.container}>
            <View style={styles.headerArea}>
                <View style= {styles.profileArea}>
                    <Image source={require('../assets/profilePic.png')} style={styles.profilePic}/>
                    <Text style={styles.profileName}>Guest</Text>
                </View>
                
                <TouchableOpacity style={styles.menuButton}>
                    <Image source={require('../assets/Menu.png')} style={styles.menuButtonIcon}/>
                </TouchableOpacity>

                
            </View>

            <Text style={styles.welcome}>Welcome to Sakhi Sahayak!!</Text>

            {
                isProfileInComplete ? (
                    <>
                        <View style={styles.inCompleteProfileContainer}>
                            <Text style={styles.inCompleteProfileHeader}>Complete your profile to stay safer!</Text>
                            <Text style={styles.inCompleteProfileText}>Keep your emergency contant updated for instant assistance</Text>
                            <Text style={styles.inCompleteProfileText}>Complete Now..</Text>

                            <View style={styles.progressBarContainer}>
                                <Progress.Bar progress={0.25} width={320} color="rgba(255, 193, 7, 1)" borderColor='rgba(0,0,0,0.1)' unfilledColor="rgba(0,0,0,0.1)" />
                                <View style={styles.progressBarTextContainer}>
                                    <Text style={styles.progressBarText}>25% Completed</Text>
                                </View>
                            </View>
                        </View>
                    </>
                ) : null
            }

            <View style={styles.optionsContainer}>
                <View style={styles.optionsRow}>
                    <TouchableOpacity style={styles.optionsButton}>
                        <Image source={require('../assets/police.png')} style={styles.optionsImage}/>
                        <Text style={styles.optionsText}>Police</Text>

                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionsButton}>
                        <Image source={require('../assets/ambulance.png')} style={styles.optionsImage}/>
                        <Text style={styles.optionsText}>Ambulance</Text>
                    </TouchableOpacity>

                </View>
                <View style={styles.optionsRow}>
                    <TouchableOpacity style={styles.optionsButton}>
                        <Image source={require('../assets/emergency.png')} style={styles.optionsImage}/>
                        <Text style={styles.optionsText}>Emergency Contact</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionsButton} onPress={() => navigation.navigate('Map')}>
                        <Image source={require('../assets/location.png')} style={styles.optionsImage}/>
                        <Text style={styles.optionsText}>Location</Text>  
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.sosContainer}>
                <View style={styles.sosCircleWrapper}>
                    <TouchableOpacity style={styles.sosButton} onPress={handleClickSOS}>
                        <Text style={styles.sosButtonText}>SOS</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles= StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E6E6FA'},
    headerArea: {marginTop: 30, flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingTop: 25, paddingHorizontal: 25},
    profileArea: {flex:1, flexDirection:'row', alignItems:'center', gap: 10},
    profilePic: {height: 50, width: 48},
    profileName: {fontFamily:'PoppinsMedium', fontSize:18},
    menuButton:{},
    menuButtonIcon:{},
    welcome:{fontFamily:'PoppinsSemiBold', marginTop:30, textAlign:'left', fontSize:20, paddingHorizontal: 25},
    inCompleteProfileContainer: {backgroundColor:'rgba(145, 80, 228, 0.3)', width: '90%', borderRadius: 18, marginTop: 20, alignSelf:'center' },
    inCompleteProfileHeader:{paddingLeft: 15, paddingRight: 15, marginTop: 25, fontFamily:'PoppinsSemiBold', fontSize:18},
    inCompleteProfileText:{paddingLeft: 15, paddingRight: 15, fontFamily:'PoppinsSemiBold', color:'rgba(0,0,0,0.6)'},
    progressBarText:{fontFamily:'PoppinsSemiBold', fontSize:18, textAlign:'left'},
    progressBarContainer:{marginVertical: 20, alignItems:'center', width: '100%'},
    progressBarTextContainer:{width: '90%', marginTop: 10},
    optionsContainer:{marginTop: 25, flexDirection:'column', alignItems:'center', width: '100%', gap: 20, marginBottom: 55},
    optionsRow:{flexDirection:'row', alignItems:'center', gap: 20},
    optionsButton:{flexDirection:'column', alignItems:'center', borderWidth: 2, width: 140, height: 140, borderRadius: 10, borderColor:'rgba(0,0,0,0.3)', padding: 5, gap: 5, justifyContent:'center'},
    optionsImage:{height: 70, width: 70},
    optionsText:{fontFamily:'PoppinsSemiBold', textAlign:'center', fontSize: 16},
    sosContainer: {
        flex:1,
        backgroundColor: '#9150E4', 
        alignItems: 'center',
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        position: 'relative',
      },
      sosCircleWrapper: {
        position: 'absolute',
        top: -40, 
        width: 120,
        height: 120,
        backgroundColor: '#FFF',
        borderRadius: 60, 
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      sosButton: {
        width: 100,
        height: 100,
        backgroundColor: '#9150E4', 
        borderRadius: 50, 
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFF', 
      },
      sosButtonText: {
        color: '#FFF',
        fontSize: 24,
        fontFamily:'PoppinsSemiBold'
      },
}); 