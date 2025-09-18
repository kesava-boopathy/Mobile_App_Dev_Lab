import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';

export default function PlayerScreen() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [playingTrack, setPlayingTrack] = useState(null);

  // Fetch Tamil music from iTunes API
  useEffect(() => {
    fetch('https://itunes.apple.com/search?term=tamil&entity=song&limit=15')
      .then((res) => res.json())
      .then((data) => {
        setTracks(data.results);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Play sound
  async function playSound(url, trackName) {
    try {
      // Stop any currently playing sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      console.log('Loading Sound...');
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
      setSound(newSound);
      setPlayingTrack(trackName);

      console.log('Playing Sound...');
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Render each track
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => playSound(item.previewUrl, item.trackName)}
    >
      <Text style={styles.trackTitle}>{item.trackName}</Text>
      <Text style={styles.trackArtist}>{item.artistName}</Text>
      {playingTrack === item.trackName && <Text style={styles.nowPlaying}>▶ Playing</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🎵 Tamil Music Player</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.trackId.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  trackItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackArtist: {
    fontSize: 14,
    color: '#555',
  },
  nowPlaying: {
    fontSize: 14,
    color: 'green',
    marginTop: 4,
  },
});