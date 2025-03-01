import { useState, useEffect, useRef } from 'react';
import { CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Audio } from 'expo-av';

export interface UseCameraOptions {
  initialFacing?: CameraType;
}

export function useCamera({ initialFacing = 'back' }: UseCameraOptions = {}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>(initialFacing);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Initialize camera and audio permissions
  useEffect(() => {
    const initializePermissions = async () => {
      // Request camera permission if not already granted
      if (!permission?.granted) {
        await requestPermission();
      }
      
      // Request audio permissions
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    };
    
    initializePermissions();
  }, [permission, requestPermission]);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const pickImage = async () => {
    try {
      // Request media library permissions if needed
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Media library permission not granted');
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      
      if (result.canceled || !result.assets || !result.assets[0]?.uri) {
        return null;
      }
      
      return result.assets[0].uri;
    } catch (error) {
      console.error('Error picking image:', error);
      return null;
    }
  };

  const processImage = async (uri: string) => {
    try {
      setIsProcessing(true);
      
      // Optimize the image before processing
      const processed = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        { 
          compress: 0.7, 
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );
      
      return processed.uri;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Voice command handling
  const startListening = async () => {
    if (isProcessing || isListening) return;
    
    try {
      setIsListening(true);
      
      // Initialize recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      
      // Stop after 3 seconds
      setTimeout(() => {
        stopListening();
      }, 3000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    if (!recordingRef.current) return;
    
    try {
      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsListening(false);
      
      return uri;
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsListening(false);
      return null;
    }
  };

  return {
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
  };
}