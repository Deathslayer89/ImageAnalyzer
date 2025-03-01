import React from 'react';
import { View, Text } from 'react-native';
import { CameraPermissionStatus } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../ui/Button';

interface CameraPermissionProps {
  status: CameraPermissionStatus | null;
  onRequestPermission: () => void;
}

export function CameraPermission({ status, onRequestPermission }: CameraPermissionProps) {
  if (status === null) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-4">
        <View className="bg-gray-800/50 w-16 h-16 rounded-full items-center justify-center mb-4">
          <Ionicons name="camera-outline" size={28} color="#888" />
        </View>
        <Text className="text-white text-center text-lg mb-2">Initializing Camera</Text>
        <Text className="text-gray-400 text-center">Please wait while we set up the camera...</Text>
      </View>
    );
  }

  if (status !== 'granted') {
    return (
      <View className="flex-1 bg-black items-center justify-center p-4">
        <View className="bg-red-500/20 w-16 h-16 rounded-full items-center justify-center mb-4">
          <Ionicons name="camera-off-outline" size={28} color="#ef4444" />
        </View>
        <Text className="text-white text-center text-lg mb-2">Camera Access Required</Text>
        <Text className="text-gray-400 text-center mb-6">
          We need permission to use your camera to analyze images. Your privacy is important to us and all processing is done securely.
        </Text>
        <Button onPress={onRequestPermission}>
          Grant Camera Permission
        </Button>
      </View>
    );
  }

  return null;
}