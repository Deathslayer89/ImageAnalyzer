import { useEffect, useState, useRef } from "react"
import { StyleSheet, Text, View, TouchableOpacity, Platform } from "react-native"
import { CameraView, CameraType, useCameraPermissions } from "expo-camera"
import * as ImageManipulator from "expo-image-manipulator"
import * as FileSystem from 'expo-file-system'
import { toByteArray } from 'base64-js' // Corrected import
import { supabase } from "../../lib/supabase"
import { analyzeImage } from "../../lib/gemini"
import { Ionicons } from "@expo/vector-icons"
import { router } from 'expo-router'

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back")
  const [permission, requestPermission] = useCameraPermissions()
  const [isProcessing, setIsProcessing] = useState(false)
  const cameraRef = useRef<CameraView | null>(null)

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  const uploadImageToSupabase = async (uri: string) => {
    try {
      // Read the file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      // Convert base64 to Uint8Array
      const imageData = toByteArray(base64)

      // Generate a unique filename
      const filename = `image_${Date.now()}.jpg`
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('images')
        .upload(filename, imageData, {
          contentType: 'image/jpeg',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL of the uploaded image
      const { data: { publicUrl } } = supabase
        .storage
        .from('images')
        .getPublicUrl(filename)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const takePicture = async () => {
    if (!permission?.granted || !cameraRef.current || isProcessing) {
      console.log("Camera permission not granted or camera not ready or processing")
      return
    }

    try {
      setIsProcessing(true)

      // Take the picture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true // Enable base64 for Gemini processing
      })

      if (!photo) return;

      // Resize the image to a reasonable size
      const resizedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1024 } }],
        { 
          compress: 0.7, 
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true 
        }
      )

      // Upload to Supabase Storage and get public URL
      const publicUrl = await uploadImageToSupabase(resizedPhoto.uri)

      // Save initial record with processing status
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
        .select()

      if (initialError) throw initialError

      // Analyze the image
      try {
        const analysis = await analyzeImage(resizedPhoto.uri)
        
        // Update record with analysis results and success status
        const { data, error } = await supabase
          .from("image_analysis")
          .update({
            analysis: analysis,
            status: "success",
          })
          .eq('id', initialData[0].id)
          .select()

        if (error) throw error

        // Navigate to results screen
        router.push('/results')
      } catch (analysisError) {
        // Update record with error status
        await supabase
          .from("image_analysis")
          .update({
            analysis: "Failed to analyze image",
            status: "error",
          })
          .eq('id', initialData[0].id)

        throw analysisError
      }
      
    } catch (error) {
      console.error("Error processing image:", error)
      // You might want to show an error message to the user here
    } finally {
      setIsProcessing(false)
    }
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
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
              isProcessing && styles.captureButtonDisabled
            ]} 
            onPress={takePicture}
            disabled={isProcessing}
          >
            <Ionicons 
              name={isProcessing ? "hourglass" : "camera"} 
              size={32} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  )
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
})