// 1. Update app/_layout.tsx to add error handling for Supabase initialization

import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../lib/supabase';
import React from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';

export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        // Check initial session
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        setSession(data.session);
        
        // Redirect based on session state
        if (data.session) {
          router.replace('/(tabs)'); // Redirect to tabs if signed in
        } else {
          router.replace('/auth/sign-up'); // Redirect to sign-up if not signed in
        }
      } catch (err: any) {
        console.error('Error checking session:', err);
        setError(err.message || 'Failed to connect to Supabase');
        Alert.alert('Connection Error', 'Failed to connect to our services. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
      }
    }

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      if (session) {
        router.replace('/(tabs)'); // Redirect to tabs if signed in
      } else {
        router.replace('/auth/sign-up'); // Redirect to sign-up if signed out
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
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth routes */}
        <Stack.Screen name="auth" />
        {/* Tabs routes */}
        <Stack.Screen name="(tabs)" />
        {/* Not found route */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
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
  },
});