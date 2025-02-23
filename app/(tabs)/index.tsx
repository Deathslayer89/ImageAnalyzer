import { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Platform, Animated } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from 'expo-file-system';
import { toByteArray } from 'base64-js';
import { supabase } from "../../lib/supabase";
import { analyzeImage } from "../../lib/gemini";
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const [progress, setProgress] = useState(0); // Progress state for the loading bar
  const progressAnim = useRef(new Animated.Value(0)).current; // Animated value for smooth transition

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    if (isProcessing) {
      // Simulate progress animation from 0 to 100
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000, // Adjust duration as needed (e.g., based on typical processing time)
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(0); // Reset progress when not processing
    }
  }, [isProcessing]);

  const uploadImageToSupabase = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const imageData = toByteArray(base64);
      const filename = `image_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('images')
        .upload(filename, imageData, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase
        .storage
        .from('images')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const takePicture = async () => {
    if (!permission?.granted || !cameraRef.current || isProcessing) {
      console.log("Camera permission not granted or camera not ready or processing");
      return;
    }

    try {
      setIsProcessing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      if (!photo) return;

      const resizedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1024 } }],
        { 
          compress: 0.7, 
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      const publicUrl = await uploadImageToSupabase(resizedPhoto.uri);

      const { data: initialData, error: initialError } = await supabase
        .from("image_analysis")
        .insert([
          {
            image_url: publicUrl,
            analysis: "Processing image...",
            status: "processing",
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (initialError) throw initialError;

      try {
        const analysis = await analyzeImage(resizedPhoto.uri);
        const { data, error } = await supabase
          .from("image_analysis")
          .update({
            analysis: analysis,
            status: "success",
          })
          .eq('id', initialData[0].id)
          .select();

        if (error) throw error;

        router.push('/results');
      } catch (analysisError) {
        await supabase
          .from("image_analysis")
          .update({
            analysis: "Failed to analyze image",
            status: "error",
          })
          .eq('id', initialData[0].id);

        throw analysisError;
      }
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.captureButton,
              isProcessing && styles.captureButtonDisabled,
            ]} 
            onPress={takePicture}
            disabled={isProcessing}
          >
            <Ionicons 
              name="camera" // Always show camera icon, progress is handled separately
              size={32} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
        {isProcessing && (
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
            <Text style={styles.progressText}>Processing...</Text>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.7,
  },
  text: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Toast-like semi-transparent background
    padding: 10,
    alignItems: "center",
  },
  progressBar: {
    height: 5,
    backgroundColor: "#2563eb", // Blue progress bar
    borderRadius: 2,
  },
  progressText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
  },
});