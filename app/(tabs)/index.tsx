// app/(tabs)/index.tsx
import React from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { CameraViewComponent } from '@/components/camera/CameraView';
import { CameraPermission } from '@/components/camera/CameraPermission';
import { useCamera } from '@/hooks/useCamera';
import { useImageAnalysis } from '@/hooks/useImageAnalysis';
import { useAuth } from '@/context/AuthContext';

export default function CameraScreen() {
  const { user } = useAuth();
  const {
    permission,
    requestPermission,
    facing,
    toggleCameraFacing,
    isProcessing,
    pickImage,
    processImage,
    isListening,
    startListening,
    stopListening,
  } = useCamera();

  const { analyzeAndSaveImage } = useImageAnalysis(user);

  const handleCapture = (uri: string) => {
    // If triggered by voice command, uri will be "command_triggered"
    // in which case the camera component will handle the capture
    if (uri === "command_triggered") {
      return;
    }
    
    processImage(uri)
      .then(processedUri => analyzeAndSaveImage(processedUri))
      .catch(error => Alert.alert('Error', 'Failed to process image.', [{ text: 'OK' }]));
  };

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) {
      handleCapture(uri);
    }
  };

  if (!permission) {
    return <CameraPermission status={null} onRequestPermission={requestPermission} />;
  }

  if (!permission.granted) {
    return <CameraPermission status={permission.status} onRequestPermission={requestPermission} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraViewComponent
        facing={facing}
        onToggleFacing={toggleCameraFacing}
        onCapture={handleCapture}
        onPickImage={handlePickImage}
        isProcessing={isProcessing}
        onStartListening={startListening}
        onStopListening={stopListening}
        isListening={isListening}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});