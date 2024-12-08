// SidebarNavigation.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const SidebarNavigation = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(true);

  const handleNavigation = (screen) => {
    setModalVisible(false);
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.sidebar}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Profile')}>
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Contacts')}>
              <Text style={styles.menuText}>Contacts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Tutorials')}>
              <Text style={styles.menuText}>Tutorials</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Login')}>
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#9150E4',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebar: {
    backgroundColor: 'white',
    width: 250,
    padding: 20,
    borderRadius: 10,
  },
  menuItem: {
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 18,
    color: '#9150E4',
  },
});

export default SidebarNavigation;
