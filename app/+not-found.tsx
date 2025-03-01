import React from 'react';
import { View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 bg-black items-center justify-center p-6">
        <View className="mb-6 bg-red-500/20 p-4 rounded-full">
          <Ionicons name="alert-circle-outline" size={32} color="#ef4444" />
        </View>
        <Text className="text-white text-xl font-bold mb-3">This page doesn't exist.</Text>
        <Text className="text-gray-400 text-center mb-6">
          The page you're looking for cannot be found or might have been removed.
        </Text>
        <Link href="/" asChild>
          <Button>Go to home screen</Button>
        </Link>
      </View>
    </>
  );
}