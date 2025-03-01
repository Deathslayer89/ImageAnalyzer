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
  const [progressWidth, setProgressWidth] = useState(0);

  // Animate progress when processing
  useEffect(() => {
    if (isProcessing) {
      setProgressWidth(0);
      const interval = setInterval(() => {
        setProgressWidth((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 30);
      
      return () => clearInterval(interval);
    } else {
      setProgressWidth(0);
    }
  }, [isProcessing]);

  const handleCapture = () => {
    if (isProcessing || !cameraRef.current) return;
    
    // Use promise chaining instead of async/await
    cameraRef.current.takePictureAsync({
      quality: 0.7,
      base64: true,
    }).then(photo => {
      if (photo?.uri) {
        onCapture(photo.uri);
      }
    }).catch(error => {
      console.error('Error taking picture:', error);
    });
  };
  
  const handleVoiceCommand = () => {
    if (isProcessing) return;
    
    if (isListening) {
      onStopListening?.();
    } else {
      onStartListening?.();
    }
  };

  return (
    <View className="flex-1 bg-black">
      <ExpoCameraView
        ref={cameraRef}
        className="flex-1"
        facing={facing}
      >
        <View className="absolute bottom-6 w-full flex-row justify-center space-x-5">
          <TouchableOpacity
            onPress={handleCapture}
            disabled={isProcessing}
            className={cn(
              "w-16 h-16 rounded-full bg-gray-800/80 items-center justify-center",
              isProcessing && "opacity-50"
            )}
          >
            <Ionicons name="camera-outline" size={28} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onToggleFacing}
            disabled={isProcessing}
            className={cn(
              "w-16 h-16 rounded-full bg-gray-800/80 items-center justify-center",
              isProcessing && "opacity-50"
            )}
          >
            <Ionicons name="camera-reverse-outline" size={28} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onPickImage}
            disabled={isProcessing}
            className={cn(
              "w-16 h-16 rounded-full bg-gray-800/80 items-center justify-center",
              isProcessing && "opacity-50"
            )}
          >
            <Ionicons name="image-outline" size={28} color="white" />
          </TouchableOpacity>
          
          {onStartListening && onStopListening && (
            <TouchableOpacity
              onPress={handleVoiceCommand}
              disabled={isProcessing}
              className={cn(
                "w-16 h-16 rounded-full bg-gray-800/80 items-center justify-center",
                isProcessing && "opacity-50",
                isListening && "bg-blue-600/80"
              )}
            >
              {isListening ? (
                <Ionicons name="mic" size={28} color="white" />
              ) : (
                <Ionicons name="mic-off" size={28} color="white" />
              )}
            </TouchableOpacity>
          )}
        </View>
        
        {isProcessing && (
          <View className="absolute bottom-0 w-full bg-black/80 p-3">
            <View className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <View 
                className="h-full bg-blue-600"
                style={{ width: `${progressWidth}%` }}
              />
            </View>
            <Text className="text-white text-xs text-center mt-1">Processing image...</Text>
          </View>
        )}
        
        {isListening && (
          <View className="absolute top-10 w-full items-center">
            <View className="px-4 py-2 bg-black/80 rounded-full">
              <Text className="text-white">Listening for commands...</Text>
            </View>
          </View>
        )}
      </ExpoCameraView>
    </View>
  );
}