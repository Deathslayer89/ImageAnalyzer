// app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { CameraViewComponent } from '@/components/camera/CameraView';
import { CameraPermission } from '@/components/camera/CameraPermission';
import { useCamera } from '@/hooks/useCamera';
import { useImageAnalysis } from '@/hooks/useImageAnalysis';

export default function CameraScreen() {
  const {
    permission,
    requestPermission,
    facing,
    toggleCameraFacing,
    isProcessing,
    setIsProcessing,
    pickImage,
    processImage,
    isListening,
    startListening,
    stopListening,
  } = useCamera();

  const { analyzeAndSaveImage } = useImageAnalysis();

  // Voice command handlers
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>(null);

  // Process image and analyze it
  const handleCapture = (uri: string) => {
    // Non-async wrapper function
    processImage(uri)
      .then(processedUri => analyzeAndSaveImage(processedUri))
      .catch(error => {
        Alert.alert(
          'Error',
          'Failed to process image. Please try again.',
          [{ text: 'OK' }]
        );
      });
  };

  // Handle image selection from gallery
  const handlePickImage = () => {
    // Non-async wrapper function
    pickImage()
      .then(uri => {
        if (uri) {
          handleCapture(uri);
        }
      })
      .catch(error => {
        console.error('Error picking image:', error);
      });
  };

  // Handle voice commands
  const handleStartListening = () => {
    // Non-async wrapper function
    startListening()
      .catch(error => {
        console.error('Error starting listening:', error);
      });
  };

  const handleStopListening = () => {
    // Non-async wrapper function
    stopListening()
      .then(audioUri => {
        if (audioUri) {
          // Mock speech-to-text for demo
          // In a real app, you'd use a speech recognition API
          const mockCommands = ['take photo', 'flip camera'];
          const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
          setLastVoiceCommand(randomCommand);
          
          if (randomCommand === 'take photo') {
            // Simulate taking a photo
            Alert.alert('Voice Command', 'Taking photo...');
          } else if (randomCommand === 'flip camera') {
            toggleCameraFacing();
          }
        }
      })
      .catch(error => {
        console.error('Error stopping listening:', error);
      });
  };

  // If no permission granted yet, show permission screen
  if (!permission) {
    return <CameraPermission status={null} onRequestPermission={requestPermission} />;
  }

  if (!permission.granted) {
    return <CameraPermission status={permission.status} onRequestPermission={requestPermission} />;
  }

  // With permission granted, show camera
  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <CameraViewComponent
        facing={facing}
        onToggleFacing={toggleCameraFacing}
        onCapture={handleCapture}
        onPickImage={handlePickImage}
        isProcessing={isProcessing}
        onStartListening={handleStartListening}
        onStopListening={handleStopListening}
        isListening={isListening}
      />
    </View>
  );
}