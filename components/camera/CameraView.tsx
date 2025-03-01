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
        audio={false} // Disable camera sound
      />
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={onPickImage}
          style={styles.button}
        >
          <Ionicons name="image-outline" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCapture}
          style={styles.button}
          disabled={isProcessing}
        >
          <Ionicons name="camera-outline" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onToggleFacing}
          style={styles.button}
        >
          <Ionicons name="camera-reverse-outline" size={28} color="white" />
        </TouchableOpacity>

        {onStartListening && onStopListening && (
          <TouchableOpacity
            onPress={isListening ? onStopListening : onStartListening}
            style={styles.button}
          >
            <Ionicons
              name={isListening ? "mic-off-outline" : "mic-outline"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        )}
      </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darker background for better contrast
  },
});