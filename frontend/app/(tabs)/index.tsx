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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Video } from 'expo-av';
import { ImagePickerAsset } from 'expo-image-picker';

const App: React.FC = () => {
  const [video, setVideo] = useState<ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const selectVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
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
      setResponseMessage(null); // Clear the response message on new selection
    }
  };

  const uploadVideo = async () => {
    if (!video) {
      Alert.alert('No Video', 'Please select a video first.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('video', {
      uri: video.uri,
      type: 'video/mp4',
      name: 'upload.mp4',
    } as any);

    try {
      const response = await axios.post('http://localhost:8080/image_posting', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Response:', response.data);
      setResponseMessage(response.data.message || 'Video processed successfully!');
    } catch (error) {
      console.error('Error:', error);
      setResponseMessage('Failed to upload or process the video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setVideo(null);
    setResponseMessage(null);
  };

  const testBackend = async () => {
    try {
      const response = await axios.get('http://localhost:8080/health_check');
      Alert.alert('Backend Status', 'Connected to backend successfully!');
    } catch (error) {
      Alert.alert('Backend Status', 'Failed to connect to the backend.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/Logo.png')} // Path to your logo image
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>FormFit</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* First Button Row: Select Video & Upload Video */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.selectButton]}
            onPress={selectVideo}
            accessibilityLabel="Select a video from your library"
          >
            <Text style={styles.buttonText}>Select Video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.uploadButton]}
            onPress={uploadVideo}
            disabled={loading || !video}
            accessibilityLabel="Upload the selected video"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Upload Video</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Second Button Row: Reset & Test Backend */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetApp}
            accessibilityLabel="Reset the app to initial state"
          >
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testBackend}
            accessibilityLabel="Test backend connection"
          >
            <Text style={styles.buttonText}>Test Backend</Text>
          </TouchableOpacity>
        </View>

        {/* Video Display */}
        {video && (
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
        )}

        {/* Response Message */}
        {responseMessage && (
          <View style={styles.responseContainer}>
            <Text style={styles.responseText}>{responseMessage}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23272a', // Discord-like soft black
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
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7289da',
  },
  featureButton: {
    backgroundColor: '#2c2f33',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#4f545c',
  },
  featureButtonText: {
    fontSize: 14,
    color: '#99aab5',
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
  resetButton: {
    backgroundColor: '#36393f',
    borderColor: '#ff5555',
  },
  testButton: {
    backgroundColor: '#36393f',
    borderColor: '#7289da',
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
  responseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#2c2f33',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4f545c',
    alignItems: 'center',
    width: '100%',
  },
  responseText: {
    color: '#99aab5',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default App;
