import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ImageBackground, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Ask permission for notifications when component runs
  Notifications.requestPermissionsAsync();
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  const getLocationAndNotify = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is needed to continue.');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    console.log(location);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Location Retrieved!',
        body: `Lat: ${location.coords.latitude}, Lon: ${location.coords.longitude}`,
      },
      trigger: null,
    });
  };

  const handleLogin = () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    Alert.alert('Login Successful', `Welcome, ${email}!`);
    getLocationAndNotify();
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1508780709619-79562169bc64' }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Button title="Login" onPress={handleLogin} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'white',
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
  },
});
