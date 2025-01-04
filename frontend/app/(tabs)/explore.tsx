import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Feather } from '@expo/vector-icons'; // Importing icons
import axios from 'axios';

export default function TabTwoScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Handle camera permissions
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to access the camera.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Feather name="camera" size={20} color="#fff" />
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => setCameraFacing((current) => (current === 'back' ? 'front' : 'back'));

  const startStreaming = () => setIsStreaming(true);
  const stopStreaming = () => setIsStreaming(false);

  const onFrame = async (frame: any) => {
    if (isStreaming) {
      try {
        await axios.post('http://localhost:8080/live-stream', {
          frame: frame.data,
        });
        console.log('Frame sent to backend');
      } catch (error) {
        console.error('Failed to send frame:', error);
        Alert.alert('Error', 'Failed to send frame.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>FormFit</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.liveStreamingContainer}>
          <Text style={styles.titleText}>Live Streaming</Text>
          <Text style={styles.descriptionText}>
            Stream live using your device's camera and send frames to our backend for processing.
          </Text>

          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              facing={cameraFacing}
              onFrame={onFrame}
            >
              <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                <Feather name="refresh-cw" size={24} color="#00FFCC" />
                <Text style={styles.flipButtonText}>Flip Camera</Text>
              </TouchableOpacity>
            </CameraView>
          </View>

          <View style={styles.streamControls}>
            {!isStreaming ? (
              <TouchableOpacity style={styles.startButton} onPress={startStreaming}>
                <Feather name="play" size={20} color="#fff" />
                <Text style={styles.buttonText}>Start Streaming</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.stopButton} onPress={stopStreaming}>
                <Feather name="stop-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>Stop Streaming</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23272a', // Discord-like dark theme
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
  scrollContainer: {
    paddingBottom: 20,
  },
  liveStreamingContainer: {
    padding: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FFCC',
    textAlign: 'center',
    marginBottom: 10,
  },
  descriptionText: {
    color: '#99aab5',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  cameraContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1C1C1C',
    shadowColor: '#00FFCC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00FFCC',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  flipButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  streamControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
    shadowColor: '#28a745',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
    shadowColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
