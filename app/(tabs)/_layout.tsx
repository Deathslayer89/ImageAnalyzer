// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function TabsLayout() {
  const { signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    if (isLoading) return;
    
    try {
      await signOut();
      // Don't navigate here - the root layout will handle navigation
    } catch (error) {
      // Error handling done in Auth context
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          backgroundColor: '#0f0f0f',
          borderTopColor: '#262626',
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#888888',
        headerStyle: {
          backgroundColor: '#0f0f0f',
          borderBottomColor: '#262626',
          borderBottomWidth: 1,
        },
        headerTintColor: '#ffffff',
        headerRight: () => (
          <TouchableOpacity 
            onPress={handleSignOut} 
            className="mx-4"
            disabled={isLoading}
          >
            <Ionicons name="log-out-outline" size={22} color="#ffffff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}