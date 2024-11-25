import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Video } from 'expo-av'; // Import the Video component
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
      <Text style={styles.title}>Video Upload App</Text>

      <TouchableOpacity style={styles.button} onPress={selectVideo}>
        <Text style={styles.buttonText}>Select Video</Text>
      </TouchableOpacity>

      {video && (
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: video.uri }}
            style={styles.video}
            useNativeControls
            resizeMode="contain"
            isLooping
          />
        </View>
      )}

      {responseMessage && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseText}>{responseMessage}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, styles.uploadButton]}
        onPress={uploadVideo}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Upload Video</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetApp}>
        <Text style={styles.buttonText}>Reset</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.testButton]} onPress={testBackend}>
        <Text style={styles.buttonText}>Test Backend Connection</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  videoContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  video: {
    width: 300,
    height: 200,
  },
  responseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  responseText: {
    color: '#343a40',
    fontSize: 16,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#28a745',
  },
  resetButton: {
    backgroundColor: '#dc3545',
  },
  testButton: {
    backgroundColor: '#17a2b8',
  },
});

export default App;
