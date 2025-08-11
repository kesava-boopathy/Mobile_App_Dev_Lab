import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Switch, Modal, TextInput } from 'react-native';

export default function App() {
  const [time, setTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [timerValue, setTimerValue] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  // Live Clock
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Timer countdown
  useEffect(() => {
    let timerInterval;
    if (timerRunning && secondsLeft > 0) {
      timerInterval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && timerRunning) {
      setTimerRunning(false);
      setShowPopup(true); // show popup when time is up
    }
    return () => clearInterval(timerInterval);
  }, [timerRunning, secondsLeft]);

  // Start timer
  const startTimer = () => {
    const sec = parseInt(timerValue, 10);
    if (!isNaN(sec) && sec > 0) {
      setSecondsLeft(sec);
      setTimerRunning(true);
    }
  };

  const backgroundColor = isDarkMode ? '#000' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#000';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Digital Clock */}
      <Text style={[styles.clockText, { color: textColor }]}>
        {time.toLocaleTimeString()}
      </Text>

      {/* Dark Mode Toggle */}
      <View style={styles.toggleRow}>
        <Text style={{ color: textColor }}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={setIsDarkMode}
        />
      </View>

      {/* Timer Input */}
      <TextInput
        style={[styles.input, { color: textColor, borderColor: textColor }]}
        placeholder="Enter seconds"
        placeholderTextColor={isDarkMode ? "#aaa" : "#555"}
        keyboardType="numeric"
        value={timerValue}
        onChangeText={setTimerValue}
      />
      <Button title="Start Timer" onPress={startTimer} />

      {/* Show remaining time */}
      {timerRunning && (
        <Text style={{ color: textColor, fontSize: 18, marginTop: 10 }}>
          Time Left: {secondsLeft} sec
        </Text>
      )}

      {/* Popup Modal */}
      <Modal
        transparent={true}
        visible={showPopup}
        animationType="slide"
        onRequestClose={() => setShowPopup(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, marginBottom: 20 }}>⏰ Time's Up!</Text>
            <Button title="Close" onPress={() => setShowPopup(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  clockText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    width: 150,
    textAlign: 'center',
    marginBottom: 10,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
});
