// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Toast from 'react-native-toast-message'; // Import Toast
import '../global.css';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isLoading, session, error } = useAuth();
  const [appIsReady, setAppIsReady] = useState(false);

  // Wait until auth is fully initialized before hiding splash screen and setting app as ready
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(console.error);
      setAppIsReady(true);
    }
  }, [isLoading]);

  // Handle navigation once app is ready
  useEffect(() => {
    if (appIsReady) {
      if (session) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth/sign-in');
      }
    }
  }, [appIsReady, session]);

  // Show loading screen while initializing
  if (!appIsReady) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  // Show error screen if there's an error
  if (error) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-4">
        <Text className="text-red-500 text-xl mb-2">Something went wrong</Text>
        <Text className="text-gray-400 text-center mb-6">{error}</Text>
      </View>
    );
  }

  // Render the navigation stack
  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" backgroundColor="black" />
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: 'black' }} className="flex-1 bg-black">
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </View>
  );
}