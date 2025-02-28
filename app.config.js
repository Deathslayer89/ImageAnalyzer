module.exports = () => {
  if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }

  return {
    expo: {
      name: "ImageAnalyzer",
      slug: "image-analyzer",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "myapp",
      userInterfaceStyle: "automatic",
      newArchEnabled: false, // Disabled to test compatibility
      ios: {
        supportsTablet: true,
      },
      web: {
        bundler: "metro",
        output: "single",
        favicon: "./assets/images/favicon.png",
      },
      plugins: [
        "expo-router",
        "expo-secure-store",
        [
          "expo-camera",
          {
            cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
            microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone",
            recordAudioAndroid: true,
          },
        ],
      ],
      experiments: {
        typedRoutes: true,
      },
      extra: {
        router: {
          origin: false,
        },
        eas: {
          projectId: "a687ad65-a539-4097-a882-e6b73f0e5b5c",
        },
        geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || "default-dev-key",
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "development",
        supabaseURL: process.env.EXPO_PUBLIC_SUPABASE_URL || "development",
      },
      android: {
        package: "com.deathslayer89.imageanalyzer",
        adaptiveIcon: {
          foregroundImage: "./assets/images/icon.png",
        },
        jsEngine: "hermes", // Explicitly enable Hermes
        enableDangerousExperimentalLeanBuilds: false, // Avoid over-optimization
      },
    },
  };
};