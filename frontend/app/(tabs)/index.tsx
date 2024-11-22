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
      Alert.alert('Success', 'Video uploaded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload video.');
    } finally {
      setLoading(false);
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
  uploadButton: {
    backgroundColor: '#28a745',
  },
});

export default App;
