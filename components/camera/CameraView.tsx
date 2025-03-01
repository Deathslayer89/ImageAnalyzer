// components/camera/CameraView.tsx
import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { CameraView as ExpoCameraView, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface CameraViewProps {
  onCapture: (uri: string) => void;
  onPickImage: () => void;
  isProcessing: boolean;
  facing: CameraType;
  onToggleFacing: () => void;
  onStartListening?: () => void;
  onStopListening?: () => void;
  isListening?: boolean;
}

export function CameraViewComponent({
  onCapture,
  onPickImage,
  isProcessing,
  facing,
  onToggleFacing,
  onStartListening,
  onStopListening,
  isListening = false,
}: CameraViewProps) {
  const cameraRef = useRef<ExpoCameraView | null>(null);

  const handleCapture = () => {
    if (isProcessing || !cameraRef.current) return;
    cameraRef.current.takePictureAsync({ quality: 0.7, base64: true })
      .then(photo => photo?.uri && onCapture(photo.uri))
      .catch(error => console.error('Capture Error:', error));
  };

  return (
    <View style={styles.container}>
      <ExpoCameraView 
        ref={cameraRef} 
        style={styles.camera}
        facing={facing}
      />
      <View style={styles.controls}>
        <TouchableOpacity 
          onPress={onPickImage} 
          style={[styles.button, styles.galleryButton]}
        >
          <Ionicons name="image-outline" size={28} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleCapture} 
          style={[styles.button, styles.captureButton]}
          disabled={isProcessing}
        >
          <Ionicons name="camera-outline" size={28} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={onToggleFacing} 
          style={[styles.button, styles.flipButton]}
        >
          <Ionicons name="camera-reverse-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Voice listening button */}
      {onStartListening && onStopListening && (
        <TouchableOpacity 
          onPress={isListening ? onStopListening : onStartListening}
          style={[
            styles.micButton,
            isListening ? styles.micButtonActive : null
          ]}
        >
          <Ionicons 
            name={isListening ? "mic" : "mic-outline"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    width: screenWidth,
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  captureButton: {
    backgroundColor: '#ef4444',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  flipButton: {
    backgroundColor: '#3b82f6',
  },
  galleryButton: {
    backgroundColor: '#22c55e',
  },
  micButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9333ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: {
    backgroundColor: '#f43f5e',
  },
});