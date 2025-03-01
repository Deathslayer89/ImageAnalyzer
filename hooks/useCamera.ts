import { useState, useEffect, useRef } from 'react';
import { CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface UseCameraOptions {
  initialFacing?: CameraType;
}

export function useCamera({ initialFacing = 'back' }: UseCameraOptions = {}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>(initialFacing);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const captureCallbackRef = useRef<((uri: string) => void) | null>(null);

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

const startListening = async (onRecognition: (text: string) => void) => {
  if (isProcessing || isListening) return;
  
  try {
    setIsListening(true);
    // Store the recognition callback
    captureCallbackRef.current = onRecognition;
    
    // Initialize recording
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync({
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
      android: {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
        extension: '.wav',
        outputFormat: Audio.AndroidOutputFormat.DEFAULT,
        audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
      },
      ios: {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
        extension: '.wav',
        outputFormat: Audio.IOSOutputFormat.LINEARPCM,
        audioQuality: Audio.IOSAudioQuality.HIGH,
      },
    });
    await recording.startAsync();
    recordingRef.current = recording;
    
    // Stop after 5 seconds for voice recognition
    setTimeout(() => {
      stopListening();
    }, 5000);
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
    
    if (uri) {
      // Process the audio for speech recognition
      processSpeechCommand(uri);
    }
    
    setIsListening(false);
    return uri;
  } catch (error) {
    console.error('Error stopping recording:', error);
    setIsListening(false);
    return null;
  }
};

// Speech recognition 
const processSpeechCommand = async (audioUri: string) => {
  try {
    console.log("Processing audio from:", audioUri);
    
    // In a real app, you would send the audio to a speech-to-text service
    // For demo purposes, we'll simulate recognition with example text
    
    // Simulate speech recognition result
    const recognizedText = "Analyze this object and tell me what it is";
    
    // Call the recognition callback with the recognized text
    if (captureCallbackRef.current) {
      captureCallbackRef.current(recognizedText);
    }
  } catch (error) {
    console.error('Error processing speech:', error);
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