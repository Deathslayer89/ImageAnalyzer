import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';

import '../global.css';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isLoading, session, error } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-4">
        <Text className="text-red-500 text-xl mb-2">Something went wrong</Text>
        <Text className="text-gray-400 text-center mb-6">{error}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{ headerShown: false, animation: 'fade' }}
        initialRouteName={session ? '(tabs)' : 'auth'}
      >
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" backgroundColor="black" />
    </>
  );
}

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: 'black' }} className="flex-1 bg-black">
      {/* Test text to verify styling */}
      {/* <Text className="text-white text-2xl">Root Layout</Text> */}
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </View>
  );
}