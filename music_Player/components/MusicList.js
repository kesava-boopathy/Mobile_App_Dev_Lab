import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function MusicList({ track }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: track.artworkUrl100 }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{track.trackName}</Text>
        <Text style={styles.artist}>{track.artistName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginVertical: 8,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  artist: { fontSize: 14, color: 'gray' }
});
