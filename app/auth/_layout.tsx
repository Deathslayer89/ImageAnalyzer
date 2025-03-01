import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { 
            backgroundColor: '#000' 
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="verify" />
      </Stack>
    </>
  );
}