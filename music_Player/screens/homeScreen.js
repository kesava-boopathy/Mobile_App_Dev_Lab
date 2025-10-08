import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import MusicList from '../components/MusicList';

export default function HomeScreen() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    fetch('https://itunes.apple.com/search?term=tamil&entity=song&country=in&limit=20')
      .then(res => res.json())
      .then(data => setTracks(data.results))
      .catch(err => console.error(err));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 Music Tracks</Text>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.trackId.toString()}
        renderItem={({ item }) => <MusicList track={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 }
});
