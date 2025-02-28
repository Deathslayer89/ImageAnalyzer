import { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Platform, Animated } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from "expo-image-picker"; // New import
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
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    if (isProcessing) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(0);
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

  const processImage = async (uri: string) => {
    if (isProcessing) {
      console.log("Already processing an image");
      return;
    }

    try {
      setIsProcessing(true);

      const resizedPhoto = await ImageManipulator.manipulateAsync(
        uri,
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

  const takePicture = async () => {
    if (!permission?.granted || !cameraRef.current) {
      console.log("Camera permission not granted or camera not ready");
      return;
    }
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.7,
      base64: true,
    });
    if (photo) {
      await processImage(photo.uri);
    }
  };

  const pickImage = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      console.log("Media library permission not granted");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      await processImage(result.assets[0].uri);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
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
          {/* Capture Button */}
          <TouchableOpacity 
            style={[
              styles.captureButton,
              isProcessing && styles.captureButtonDisabled,
            ]} 
            onPress={takePicture}
            disabled={isProcessing}
          >
            <Ionicons 
              name="camera"
              size={32} 
              color="white" 
            />
          </TouchableOpacity>

          {/* Flip Camera Button */}
          <TouchableOpacity
            style={[
              styles.flipButton,
              isProcessing && styles.captureButtonDisabled,
            ]}
            onPress={toggleCameraFacing}
            disabled={isProcessing}
          >
            <Ionicons
              name="camera-reverse"
              size={32}
              color="white"
            />
          </TouchableOpacity>

          {/* Upload Image Button */}
          <TouchableOpacity
            style={[
              styles.uploadButton,
              isProcessing && styles.captureButtonDisabled,
            ]}
            onPress={pickImage}
            disabled={isProcessing}
          >
            <Ionicons
              name="image"
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
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 20,
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
  flipButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 10,
    alignItems: "center",
  },
  progressBar: {
    height: 5,
    backgroundColor: "#2563eb",
    borderRadius: 2,
  },
  progressText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
  },
});