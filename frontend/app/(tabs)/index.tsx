import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

interface ImageAsset {
  uri: string;
}

const App: React.FC = () => {
  const [image, setImage] = useState<ImageAsset | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const selectImage = async () => {
    // Request permission to access media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'You need to grant permission to access your photos.');
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setImage(result.assets[0]);
    }
  };

  const uploadImage = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', {
      uri: image.uri,
      type: 'image/jpeg', 
      name: 'upload.jpg',
    } as any);

    try {
      const response = await axios.post('https://your-api-endpoint.com/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Alert.alert('Success', 'Image uploaded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Image Upload App</Text>

      <TouchableOpacity style={styles.button} onPress={selectImage}>
        <Text style={styles.buttonText}>Select Image</Text>
      </TouchableOpacity>

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image.uri }} style={styles.image} />
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, styles.uploadButton]}
        onPress={uploadImage}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Upload Image</Text>
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
  imageContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  uploadButton: {
    backgroundColor: '#28a745',
  },
});

export default App;
