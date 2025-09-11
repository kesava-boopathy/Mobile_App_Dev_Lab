import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function PlayerControls({ onPlay, onPause, onNext, onPrev }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrev}>
        <Text style={styles.button}>⏮ Prev</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPlay}>
        <Text style={styles.button}>▶ Play</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPause}>
        <Text style={styles.button}>⏸ Pause</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onNext}>
        <Text style={styles.button}>⏭ Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  button: {
    fontSize: 18,
    color: 'white',
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
});
