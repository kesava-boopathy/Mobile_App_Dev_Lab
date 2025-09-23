import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import PlayerControls from '../components/playerControl';

export default function PlayerScreen() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null); // index of current track
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch Tamil music
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

  // Play track by index
  async function playTrack(index) {
    try {
      const track = tracks[index];
      if (!track) return;

      // Stop old sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      console.log('Loading Sound...');
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: track.previewUrl });
      setSound(newSound);
      setCurrentIndex(index);

      console.log('Playing:', track.trackName);
      await newSound.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // Pause
  async function pauseTrack() {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  }

  // Resume
  async function resumeTrack() {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    } else if (currentIndex !== null) {
      playTrack(currentIndex);
    }
  }

  // Next
  function playNext() {
    if (currentIndex !== null && currentIndex < tracks.length - 1) {
      playTrack(currentIndex + 1);
    }
  }

  // Prev
  function playPrev() {
    if (currentIndex !== null && currentIndex > 0) {
      playTrack(currentIndex - 1);
    }
  }

  // Cleanup
  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Render each track in list
  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => playTrack(index)}
    >
      <Text style={styles.trackTitle}>{item.trackName}</Text>
      <Text style={styles.trackArtist}>{item.artistName}</Text>
      {currentIndex === index && isPlaying && <Text style={styles.nowPlaying}>▶ Playing</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🎵 Tamil Music Player</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : (
        <>
          <FlatList
            data={tracks}
            keyExtractor={(item) => item.trackId.toString()}
            renderItem={renderItem}
          />

          {/* Player Controls */}
          {currentIndex !== null && (
            <PlayerControls
              onPlay={resumeTrack}
              onPause={pauseTrack}
              onNext={playNext}
              onPrev={playPrev}
            />
          )}
        </>
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
