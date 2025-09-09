// App.js
import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";

import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";

import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";

//
// Theme context (so Settings can toggle theme)
//
const ThemeToggleContext = createContext();

function useThemeToggle() {
  return useContext(ThemeToggleContext);
}

//
// === PlayerController (singleton-like hook) ===
// Manages Audio.Sound, playback status and exposes controls.
// Keep single instance so different screens can use it.
//
function usePlayerController() {
  const soundRef = useRef(null);
  const [status, setStatus] = useState({
    isPlaying: false,
    positionMillis: 0,
    durationMillis: 0,
    isLoaded: false,
  });
  const currentTrackRef = useRef(null);

  // create new sound for a track (uri), unload previous
  const loadTrack = async (track) => {
    try {
      // if same track & loaded, do nothing
      if (currentTrackRef.current?.trackId === track.trackId && status.isLoaded) {
        return;
      }
      // unload previous
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch (e) {}
        soundRef.current.setOnPlaybackStatusUpdate(null);
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.previewUrl },
        { shouldPlay: false, staysActiveInBackground: false }
      );

      soundRef.current = sound;
      currentTrackRef.current = track;

      soundRef.current.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (!playbackStatus) return;
        setStatus({
          isPlaying: playbackStatus.isPlaying,
          positionMillis: playbackStatus.positionMillis ?? 0,
          durationMillis: playbackStatus.durationMillis ?? 0,
          isLoaded: playbackStatus.isLoaded ?? false,
        });
      });
    } catch (err) {
      console.error("Error loading track", err);
      Alert.alert("Playback error", "Could not load track preview.");
    }
  };

  const play = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.playAsync();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const pause = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.pauseAsync();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const stop = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const seekTo = async (millis) => {
    if (soundRef.current) {
      try {
        await soundRef.current.setPositionAsync(Math.max(0, Math.min(millis, status.durationMillis || 0)));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const unload = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (e) {}
      soundRef.current = null;
      currentTrackRef.current = null;
      setStatus({ isPlaying: false, positionMillis: 0, durationMillis: 0, isLoaded: false });
    }
  };

  // stop & unload on unmount
  useEffect(() => {
    return () => {
      (async () => {
        if (soundRef.current) {
          try {
            await soundRef.current.unloadAsync();
          } catch (e) {}
        }
      })();
    };
  }, []);

  return {
    loadTrack,
    play,
    pause,
    stop,
    seekTo,
    unload,
    status,
    currentTrack: currentTrackRef.current,
  };
}

//
// === HomeScreen: search iTunes & list tracks ===
//
function HomeScreen({ navigation, player }) {
  const [query, setQuery] = useState("adele");
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState([]);

  const fetchTracks = async (term) => {
    try {
      setLoading(true);
      const q = encodeURIComponent(term.trim());
      const url = `https://itunes.apple.com/search?term=${q}&entity=song&limit=25`;
      const res = await fetch(url);
      const json = await res.json();
      setTracks(json.results || []);
    } catch (e) {
      console.error(e);
      Alert.alert("Network error", "Could not fetch tracks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks(query);
  }, []);

  const onSelectTrack = async (track) => {
    // load the chosen track into player and navigate to Player screen
    await player.loadTrack(track);
    navigation.navigate("Player", { track });
  };

  const TrackItem = ({ item }) => (
    <TouchableOpacity style={styles.trackItem} onPress={() => onSelectTrack(item)}>
      <Image source={{ uri: item.artworkUrl100 }} style={styles.artwork} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={styles.trackTitle}>{item.trackName}</Text>
        <Text numberOfLines={1} style={styles.trackArtist}>{item.artistName}</Text>
      </View>
      <TouchableOpacity style={styles.playSmall} onPress={() => onSelectTrack(item)}>
        <Text style={{ color: "#fff" }}>▶</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.searchRow}>
        <TextInputStyled value={query} onChangeText={setQuery} placeholder="Search artist or song" style={{ flex: 1 }} />
        <TouchableOpacity style={styles.searchButton} onPress={() => fetchTracks(query)}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : null}

      <FlatList
        data={tracks}
        keyExtractor={(i) => String(i.trackId)}
        renderItem={({ item }) => <TrackItem item={item} />}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
}

//
// small TextInput styled component
//
function TextInputStyled(props) {
  return (
    <View style={{ backgroundColor: "#f0f0f0", borderRadius: 8, paddingHorizontal: 10 }}>
      <TextInputShim {...props} />
    </View>
  );
}
function TextInputShim({ value, onChangeText, placeholder, style }) {
  // lightweight shim to avoid importing keyboard-heavy components separately
  // use a simple TextInput from react-native
  const { TextInput } = require("react-native");
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      style={[{ height: 42, fontSize: 16 }, style]}
      returnKeyType="search"
    />
  );
}

//
// === PlayerScreen: shows selected track + full controls ===
//
function PlayerScreen({ route, player }) {
  const track = route?.params?.track;
  const { status } = player;

  // small helpers to format time
  const fmt = (ms) => {
    if (!ms || ms <= 0) return "00:00";
    const s = Math.floor(ms / 1000);
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return (
    <View style={styles.screen}>
      <View style={styles.playerHeader}>
        <Image source={{ uri: track?.artworkUrl100 }} style={styles.largeArtwork} />
        <Text style={styles.playerTitle}>{track?.trackName}</Text>
        <Text style={styles.playerArtist}>{track?.artistName}</Text>
      </View>

      <View style={styles.controls}>
        <Text style={styles.timeText}>{fmt(status.positionMillis)}</Text>

        <Slider
          style={{ flex: 1, marginHorizontal: 10 }}
          minimumValue={0}
          maximumValue={status.durationMillis || 1}
          value={status.positionMillis}
          onSlidingComplete={(val) => player.seekTo(Math.floor(val))}
          minimumTrackTintColor="#e91e63"
          maximumTrackTintColor="#ddd"
          thumbTintColor="#e91e63"
        />

        <Text style={styles.timeText}>{fmt(status.durationMillis)}</Text>
      </View>

      <View style={styles.bigButtons}>
        <TouchableOpacity style={styles.ctrlBtn} onPress={() => player.seekTo((status.positionMillis || 0) - 10000)}>
          <Text style={styles.ctrlLabel}>⏪ 10s</Text>
        </TouchableOpacity>

        {!status.isPlaying ? (
          <TouchableOpacity
            style={[styles.playBtn]}
            onPress={() => player.play()}
          >
            <Text style={{ fontSize: 18, color: "#fff", fontWeight: "700" }}>Play</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.playBtn, { backgroundColor: "#444" }]}
            onPress={() => player.pause()}
          >
            <Text style={{ fontSize: 18, color: "#fff", fontWeight: "700" }}>Pause</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.ctrlBtn} onPress={() => player.seekTo((status.positionMillis || 0) + 10000)}>
          <Text style={styles.ctrlLabel}>10s ⏩</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 24 }}>
        <TouchableOpacity style={styles.smallAction} onPress={() => player.stop()}>
          <Text style={{ color: "#fff" }}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.smallAction}
          onPress={() => {
            Alert.alert("Info", "Add favorite feature later.");
          }}
        >
          <Text style={{ color: "#fff" }}>❤ Favorite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

//
// === Settings screen: theme toggle ===
//
function SettingsScreen({ setThemeName, themeName }) {
  return (
    <View style={styles.screen}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Appearance</Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
          style={[styles.themeBtn, themeName === "light" && { backgroundColor: "#e91e63" }]}
          onPress={() => setThemeName("light")}
        >
          <Text style={{ color: "#fff" }}>Light</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.themeBtn, themeName === "dark" && { backgroundColor: "#e91e63" }]}
          onPress={() => setThemeName("dark")}
        >
          <Text style={{ color: "#fff" }}>Dark</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

//
// === App (root) ===
//
const Drawer = createDrawerNavigator();

export default function App() {
  // set up player controller and pass into screens via props
  const player = usePlayerController();

  // theme state
  const [themeName, setThemeName] = useState("light");

  // navigation container theme
  const navigationTheme = themeName === "dark" ? DarkTheme : DefaultTheme;

  // make Drawer with functional screens, pass player object via initialParams or component props
  return (
    <ThemeToggleContext.Provider value={{ themeName, setThemeName }}>
      <NavigationContainer theme={navigationTheme}>
        <Drawer.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: themeName === "dark" ? "#111" : "#fff" },
            headerTintColor: themeName === "dark" ? "#fff" : "#000",
          }}
        >
          <Drawer.Screen name="Home">
            {(props) => <HomeScreen {...props} player={player} />}
          </Drawer.Screen>

          <Drawer.Screen name="Player">
            {(props) => <PlayerScreen {...props} player={player} />}
          </Drawer.Screen>

          <Drawer.Screen name="Settings">
            {(props) => <SettingsScreen {...props} themeName={themeName} setThemeName={setThemeName} />}
          </Drawer.Screen>
        </Drawer.Navigator>
      </NavigationContainer>
    </ThemeToggleContext.Provider>
  );
}

//
// === Styles ===
//
const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: "#121212" },
  trackItem: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
  },
  artwork: { width: 64, height: 64, borderRadius: 6, marginRight: 10 },
  trackTitle: { color: "#fff", fontWeight: "700", marginBottom: 3 },
  trackArtist: { color: "#ccc", fontSize: 13 },
  playSmall: {
    backgroundColor: "#e91e63",
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },

  // search
  searchRow: { flexDirection: "row", gap: 8, marginBottom: 12, alignItems: "center" },
  searchButton: { backgroundColor: "#e91e63", padding: 10, borderRadius: 8 },

  // player
  playerHeader: { alignItems: "center", marginTop: 20 },
  largeArtwork: { width: 200, height: 200, borderRadius: 12 },
  playerTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 12, textAlign: "center" },
  playerArtist: { color: "#ccc", marginTop: 6 },

  controls: { flexDirection: "row", alignItems: "center", marginTop: 30, paddingHorizontal: 12 },
  timeText: { color: "#ddd", width: 48, textAlign: "center" },

  bigButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 18, alignItems: "center" },
  playBtn: { backgroundColor: "#e91e63", padding: 14, borderRadius: 10, minWidth: 120, alignItems: "center", justifyContent: "center" },
  ctrlBtn: { backgroundColor: "#2b2b2b", padding: 10, borderRadius: 8 },
  ctrlLabel: { color: "#fff" },

  smallAction: { backgroundColor: "#333", padding: 10, borderRadius: 8 },

  // general
  title: { color: "#fff", fontSize: 24, fontWeight: "800", marginBottom: 8 },
  themeBtn: { padding: 12, backgroundColor: "#333", borderRadius: 10 },

  // input shim styling
  button: { padding: 10, backgroundColor: "#e91e63", borderRadius: 8, marginLeft: 8 },

  // player screen UI
  previewImage: { width: "100%", height: 300, borderRadius: 12, backgroundColor: "#222" },

  // small UI
  ctrlBtn2: { padding: 10, borderRadius: 8 },

  // text input shim default (inside TextInputStyled)
  textInputShim: { height: 42, fontSize: 16, paddingHorizontal: 8, color: "#000" },
});
