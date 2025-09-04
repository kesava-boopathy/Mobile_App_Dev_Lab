import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Modal,
  ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

export default function CameraApp() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState("back");
  const [capturedImage, setCapturedImage] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("none");
  const [showFilters, setShowFilters] = useState(false);
  const cameraRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedImage(photo);
      setIsPreview(true);

      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setIsPreview(false);
  };

  const toggleCameraType = () => {
    setCameraType((prev) => (prev === "back" ? "front" : "back"));
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Requesting permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>No access to camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isPreview ? (
        <CameraView
          style={styles.camera}
          facing={cameraType}
          ref={cameraRef}
        >
          <View style={styles.controlsContainer}>
            <View style={styles.topControls}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilters(true)}
              >
                <Ionicons name="color-filter" size={24} color="white" />
                <Text style={styles.filterText}>{currentFilter}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomControls}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      ) : (
        <Animated.View style={[styles.previewContainer, { opacity: fadeAnim }]}>
          <View style={[styles.imageContainer, filterStyles[currentFilter].container]}>
            <Image
              source={{ uri: capturedImage.uri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.previewControls}>
            <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
              <Ionicons name="arrow-back" size={20} color="white" />
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Filters Modal */}
      <Modal visible={showFilters} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Filter</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.keys(filterStyles).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterOption,
                    currentFilter === filter && styles.selectedFilter,
                  ]}
                  onPress={() => {
                    setCurrentFilter(filter);
                    setShowFilters(false);
                  }}
                >
                  <View style={[styles.filterPreview, filterStyles[filter].preview]} />
                  <Text style={styles.filterOptionText}>{filter}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Real filter implementations using CSS-like properties
const filterStyles = {
  none: {
    container: {},
    preview: { backgroundColor: "transparent" }
  },
  grayscale: {
    container: { backgroundColor: "#d3d3d3" },
    preview: { backgroundColor: "#d3d3d3" }
  },
  sepia: {
    container: { backgroundColor: "#704214", opacity: 0.5 },
    preview: { backgroundColor: "#704214" }
  },
  warm: {
    container: { backgroundColor: "#ff9966", opacity: 0.3 },
    preview: { backgroundColor: "#ff9966" }
  },
  cool: {
    container: { backgroundColor: "#66ccff", opacity: 0.3 },
    preview: { backgroundColor: "#66ccff" }
  },
  vintage: {
    container: { backgroundColor: "#cd853f", opacity: 0.4 },
    preview: { backgroundColor: "#cd853f" }
  },
  blue: {
    container: { backgroundColor: "#0000ff", opacity: 0.2 },
    preview: { backgroundColor: "#0000ff" }
  },
  red: {
    container: { backgroundColor: "#ff0000", opacity: 0.2 },
    preview: { backgroundColor: "#ff0000" }
  },
  green: {
    container: { backgroundColor: "#00ff00", opacity: 0.2 },
    preview: { backgroundColor: "#00ff00" }
  },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  camera: { flex: 1 },
  controlsContainer: { flex: 1, justifyContent: "space-between" },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 40,
  },
  filterButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  filterText: { color: "white", fontWeight: "bold" },
  flipButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 20,
  },
  bottomControls: { alignItems: "center", paddingBottom: 30 },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  imageContainer: {
    width: "100%",
    height: "70%",
    borderRadius: 15,
    marginBottom: 20,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  retakeButton: {
    backgroundColor: "#ff4444",
    padding: 15,
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  retakeText: { color: "white", fontWeight: "bold" },
  modalContainer: { 
    flex: 1, 
    justifyContent: "flex-end", 
    backgroundColor: "rgba(0,0,0,0.5)" 
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  filterOption: {
    padding: 10,
    margin: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
  },
  filterPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  selectedFilter: { backgroundColor: "#007AFF" },
  filterOptionText: { color: "#333", fontWeight: "bold", fontSize: 12 },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
  },
  closeButtonText: { color: "white", fontWeight: "bold" },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});