// components/camera/CameraView.tsx
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView as ExpoCameraView, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

import { cn } from '@/lib/utils';

interface CameraViewProps {
  onCapture: (uri: string) => void; // Changed from Promise<void> to void
  onPickImage: () => void; // Changed from Promise<void> to void
  isProcessing: boolean;
  facing: CameraType;
  onToggleFacing: () => void;
  onStartListening?: () => void; // Changed from Promise<void> to void
  onStopListening?: () => void; // Changed from Promise<void> to void
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
    <View className="flex-1 bg-black h-full">
      <ExpoCameraView ref={cameraRef} className="flex-1 h-full" facing={facing}>
        <Text className="text-white">Camera Preview</Text>
        <View className="absolute bottom-6 w-full flex-row justify-center space-x-5 z-10">
          <TouchableOpacity onPress={handleCapture} className="w-16 h-16 bg-red-500 rounded-full items-center justify-center">
            <Ionicons name="camera-outline" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onToggleFacing} className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center">
            <Ionicons name="camera-reverse-outline" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onPickImage} className="w-16 h-16 bg-green-500 rounded-full items-center justify-center">
            <Ionicons name="image-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </ExpoCameraView>
    </View>
  );
}