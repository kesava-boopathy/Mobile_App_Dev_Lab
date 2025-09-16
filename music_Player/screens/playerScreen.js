import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PlayerControls from '../components/playerControl';

export default function PlayerScreen() {
  const play = () => console.log("Play music");
  const pause = () => console.log("Pause music");
  const next = () => console.log("Next track");
  const prev = () => console.log("Previous track");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎧 Music Player</Text>
      <PlayerControls onPlay={play} onPause={pause} onNext={next} onPrev={prev} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 }
});
