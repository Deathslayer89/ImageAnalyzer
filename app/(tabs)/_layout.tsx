// Update app/(tabs)/_layout.tsx to add proper error handling

import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text, View, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';
import Constants from 'expo-constants';

export default function TabLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug environment variables in development mode
  useEffect(() => {
    if (__DEV__) {
      console.log('TabLayout - Environment variables check:');
      console.log('Supabase URL:', Constants.expoConfig?.extra?.SupabaseURL ? 'Defined' : 'Missing');
      console.log('Supabase Anon Key:', Constants.expoConfig?.extra?.SupabaseAnonKey ? 'Defined' : 'Missing');
      console.log('Gemini API Key:', Constants.expoConfig?.extra?.GeminiApiKey ? 'Defined' : 'Missing');
    }
  }, []);

  useEffect(() => {
    async function initializeAuth() {
      try {
        // Check initial session
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        setSession(data.session);
        setLoading(false);

        if (!data.session) {
          console.log('No session found, redirecting to sign-up');
          router.replace('/auth/sign-up');
        }
      } catch (err: any) {
        console.error('Error in TabLayout:', err);
        setError(err.message || 'Connection error');
        setLoading(false);
        
        // Show an alert with more details in development
        if (__DEV__) {
          Alert.alert('Auth Error', `Error details: ${err.message || 'Unknown error'}`);
        } else {
          Alert.alert('Connection Error', 'Failed to connect to our services. Please try again.');
        }
      }
    }

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        console.log('Session lost, redirecting to sign-up');
        router.replace('/auth/sign-up');
      }
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Something went wrong</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.replace('/auth/sign-up')}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!session) {
    return null; // Ensures tabs don't render if no session
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: { backgroundColor: '#1a1a1a' },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#888888',
        headerStyle: { backgroundColor: '#1a1a1a' },
        headerTintColor: '#ffffff',
        headerRight: () => (
          <TouchableOpacity onPress={async () => {
            try {
              await supabase.auth.signOut();
              router.replace('/auth/sign-up');
            } catch (err) {
              console.error('Error signing out:', err);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }} style={{ marginRight: 15 }}>
            <Ionicons name="log-out" size={24} color="#ffffff" />
          </TouchableOpacity>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Camera',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 20,
    marginBottom: 10,
  },
  errorSubtext: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    width: '60%',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});