import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

function AddBookScreen({ navigation }) {
  const [name, setName] = useState('');
  const [isbn, setIsbn] = useState('');

  const addBook = async () => {
    if (name.trim() && isbn.trim()) {
      const newBook = { id: Date.now().toString(), name, isbn };
      const storedBooks = await AsyncStorage.getItem('books');
      const books = storedBooks ? JSON.parse(storedBooks) : [];
      books.push(newBook);
      await AsyncStorage.setItem('books', JSON.stringify(books));
      setName('');
      setIsbn('');
      alert('Book Added!');
    } else {
      alert('Please enter both Name and ISBN');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Add a Book</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Book Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter ISBN Number"
        value={isbn}
        onChangeText={setIsbn}
      />
      <Button title="Add Book" onPress={addBook} />
      <View style={{ marginTop: 20 }}>
        <Button title="Show Books" onPress={() => navigation.navigate('BookList')} />
      </View>
    </View>
  );
}

function BookListScreen() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const loadBooks = async () => {
      const storedBooks = await AsyncStorage.getItem('books');
      if (storedBooks) {
        setBooks(JSON.parse(storedBooks));
      }
    };
    loadBooks();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📖 Books List</Text>
      {books.length === 0 ? (
        <Text>No books found.</Text>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text style={styles.item}>{item.name} (ISBN: {item.isbn})</Text>
          )}
        />
      )}
    </View>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="AddBook" component={AddBookScreen} />
        <Stack.Screen name="BookList" component={BookListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  item: {
    fontSize: 18,
    marginBottom: 10,
  },
});
