import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import axios from 'axios';

export default function TabTwoScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Handle camera permissions
  if (!permission) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need your permission to access the camera
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Toggle between front and back cameras
  const toggleCameraFacing = () => {
    setCameraFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  // Start live streaming
  const startStreaming = () => {
    setIsStreaming(true);
  };

  // Stop live streaming
  const stopStreaming = () => {
    setIsStreaming(false);
  };

  // Handle frame processing
  const onFrame = async (frame: any) => {
    if (isStreaming) {
      try {
        // Process frame data as needed
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
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      // Remove or replace headerImage as needed
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>

      {/* Your existing content */}

      {/* Live Streaming Feature */}
      <Collapsible title="Live Streaming with Camera">
        <ThemedText>
          This feature allows live streaming using the device camera, sending frames to a Flask
          backend for processing.
        </ThemedText>
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={cameraFacing}
            onFrame={onFrame}
            frameProcessorFps={1} // Process one frame per second
          >
            <TouchableOpacity style={styles.toggleButton} onPress={toggleCameraFacing}>
              <Text style={styles.toggleButtonText}>Flip Camera</Text>
            </TouchableOpacity>
          </CameraView>
        </View>
        <View style={styles.streamControls}>
          {!isStreaming ? (
            <TouchableOpacity style={styles.startButton} onPress={startStreaming}>
              <Text style={styles.buttonText}>Start Streaming</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={stopStreaming}>
              <Text style={styles.buttonText}>Stop Streaming</Text>
            </TouchableOpacity>
          )}
        </View>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  // Your existing styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
  },
  cameraContainer: {
    marginVertical: 20,
    height: 400,
    backgroundColor: '#e9ecef',
  },
  camera: {
    flex: 1,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  streamControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  startButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
  },
  stopButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

