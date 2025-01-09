import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Video } from 'expo-av';
import { ImagePickerAsset } from 'expo-image-picker';

const App: React.FC = () => {
  const [video, setVideo] = useState<ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [frames, setFrames] = useState<string[]>([]); // Holds frame URIs
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const selectVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'You need to grant permission to access your videos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setVideo(result.assets[0]);
      setFrames([]); // Reset frames when selecting a new video
      setResponseMessage(null);
    }
  };

  const extractFrames = async () => {
    if (!video) {
      Alert.alert('No Video', 'Please select a video first.');
      return;
    }

    const frameInterval = 10 * 1000; // 30 seconds in milliseconds
    const videoDuration = 300 * 1000; // Assume 5-minute video for simulation (milliseconds)
    const frameCount = Math.floor(videoDuration / frameInterval);
    const newFrames: string[] = [];

    setLoading(true);
    try {
      for (let i = 0; i < frameCount; i++) {
        const timeMs = i * frameInterval;
        const { uri } = await VideoThumbnails.getThumbnailAsync(video.uri, { time: timeMs });
        newFrames.push(uri);
      }
      setFrames(newFrames);
      Alert.alert('Frames Extracted', `${newFrames.length} frames prepared.`);
    } catch (e) {
      console.error('Error extracting frame:', e);
      Alert.alert('Error', 'Failed to extract frames.');
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setVideo(null);
    setFrames([]);
    setResponseMessage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.appName}>FormFit</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.selectButton]}
              onPress={selectVideo}
              accessibilityLabel="Select a video from your library"
            >
              <Text style={styles.buttonText}>Select Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={resetApp}
              accessibilityLabel="Reset the app to initial state"
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {video && (
            <>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.extractButton]}
                  onPress={extractFrames}
                  disabled={loading}
                  accessibilityLabel="Extract frames from the video"
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Extract Frames</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.videoContainer}>
                <Video
                  source={{ uri: video.uri }}
                  style={styles.video}
                  useNativeControls
                  resizeMode="contain"
                  isLooping
                  accessibilityLabel="Selected video preview"
                />
              </View>
            </>
          )}

          {/* Frames Preview */}
          {frames.length > 0 && (
            <View style={styles.framePreviewContainer}>
              <Text style={styles.previewText}>Extracted Frames (256x256):</Text>
              <FlatList
                data={frames}
                keyExtractor={(item, index) => `frame-${index}`}
                horizontal
                renderItem={({ item, index }) => (
                  <View style={styles.frameImageContainer}>
                    <Image source={{ uri: item }} style={styles.frameImage} />
                    <Text style={styles.frameLabel}>Frame {index + 1}</Text>
                  </View>
                )}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

          {/* Response Message */}
          {responseMessage && (
            <View style={styles.responseContainer}>
              <Text style={styles.responseText}>{responseMessage}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23272a',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Ensure space to scroll
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2f33',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7289da',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#36393f',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4f545c',
    alignItems: 'center',
    flex: 0.48,
  },
  extractButton: {
    backgroundColor: '#7289da',
  },
  resetButton: {
    borderColor: '#ff5555',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#99aab5',
    textAlign: 'center',
  },
  videoContainer: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#2c2f33',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4f545c',
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  framePreviewContainer: {
    marginTop: 20,
  },
  previewText: {
    color: '#99aab5',
    fontSize: 16,
    marginBottom: 10,
  },
  frameImageContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  frameImage: {
    width: 256,
    height: 256,
    borderRadius: 8,
  },
  frameLabel: {
    marginTop: 5,
    color: '#99aab5',
    fontSize: 14,
    textAlign: 'center',
  },
  responseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#2c2f33',
    borderRadius: 12,
  },
  responseText: {
    color: '#99aab5',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default App;
