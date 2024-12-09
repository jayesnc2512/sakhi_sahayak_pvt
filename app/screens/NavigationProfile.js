import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const SidebarNavigation = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(true);
  const [activeButton, setActiveButton] = useState(null);

  useFocusEffect(
    useCallback(() => {
      // Reopen modal when navigating back to this screen
      setModalVisible(true);
    }, [])
  );

  const handleNavigation = (screen) => {
    setModalVisible(false);
    setActiveButton(null);
    navigation.navigate(screen);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setActiveButton(null);
  };

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleCloseModal}
    >
      <TouchableWithoutFeedback onPress={handleCloseModal}>
        <View style={styles.modalBackground}>
          <View style={styles.sidebar}>
            <Text style={styles.sidebarHeader}>Navigation Menu</Text>
            {['Profile', 'Contacts', 'Tutorials', 'Login'].map((screen, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  activeButton === screen && styles.menuItemActive,
                ]}
                onPressIn={() => setActiveButton(screen)}
                onPressOut={() => handleNavigation(screen)}
              >
                <Text style={styles.menuText}>{screen}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebar: {
    backgroundColor: 'white',
    width: 260,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sidebarHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9150E4',
    marginBottom: 20,
    textAlign: 'center',
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#F9F9F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  },
  menuItemActive: {
    backgroundColor: '#E6E6FA',
    borderColor: '#9150E4',
    borderWidth: 1,
  },
  menuText: {
    fontSize: 18,
    color: '#9150E4',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SidebarNavigation;
