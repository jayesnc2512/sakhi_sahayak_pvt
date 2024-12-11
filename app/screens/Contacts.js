// ContactScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

const ContactScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [favoriteContacts, setFavoriteContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync();
        setContacts(data);
      }
    };
  
    const fetchFavoriteContacts = async () => {
      const storedFavoriteContacts = await SecureStore.getItemAsync('favoriteContacts');
      if (storedFavoriteContacts) {
        const favoriteContactsIds = JSON.parse(storedFavoriteContacts);
        setFavoriteContacts(favoriteContactsIds);
      }
    };
  
    fetchContacts();
    fetchFavoriteContacts();
  }, []);
  
  const handleFavoriteContact = async (contact) => {
    const isFavorite = favoriteContacts.includes(contact.id);
    let updatedFavorites;
  
    if (isFavorite) {
      updatedFavorites = favoriteContacts.filter((id) => id !== contact.id);
    } else {
      updatedFavorites = [...favoriteContacts, contact.id];
    }
  
    setFavoriteContacts(updatedFavorites);
    await SecureStore.setItemAsync('favoriteContacts', JSON.stringify(updatedFavorites));
  };
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedContacts = [
    ...favoriteContacts.map(id => contacts.find(contact => contact.id === id)).filter(Boolean),
    ...filteredContacts.filter(contact => !favoriteContacts.includes(contact.id))
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contacts</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Contacts"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={sortedContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.contact} onPress={() => handleFavoriteContact(item)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.phone}>{item.phoneNumbers ? item.phoneNumbers[0].number : 'No Phone'}</Text>
            <TouchableOpacity onPress={() => handleFavoriteContact(item)}>
              {favoriteContacts.includes(item.id) ? (
                <Ionicons name="star" size={24} color="#FFD700" />
              ) : (
                <Ionicons name="star-outline" size={24} color="#ccc" />
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      {/* <TouchableOpacity style={styles.favButton} onPress={() => navigation.navigate('FavoriteContacts', { favoriteContacts })}>
        <Text style={styles.favButtonText}>View Favorite Contacts</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingTop: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  contact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  phone: {
    fontSize: 16,
    color: '#666',
  },
  favButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  favButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ContactScreen;