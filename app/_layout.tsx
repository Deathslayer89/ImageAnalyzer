import React, { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../lib/supabase';
import * as SplashScreen from 'expo-splash-screen';
import { Text, View, StyleSheet, Alert } from 'react-native';
import Constants from 'expo-constants';
import { LinkHref } from 'expo-router';
import { AuthChangeEvent, Session, SupabaseClient } from '@supabase/supabase-js';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Define the type for the Supabase client
type AppSupabaseClient = SupabaseClient<any, 'public', any>;

// Define the type for the extra config in Constants
interface AppConfig {
  supabaseURL?: string;
  supabaseAnonKey?: string;
  geminiApiKey?: string;
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialScreen, setInitialScreen] = useState<string>('auth'); // Use screen name, not path
  const [nestedRoute, setNestedRoute] = useState<LinkHref | null>(null); // For nested navigation like /auth/sign-up

  useEffect(() => {
    // Log environment variables for debugging
    console.log('Environment Variables:', {
      supabaseUrl: (Constants.expoConfig?.extra as AppConfig)?.supabaseURL,
      supabaseAnonKey: (Constants.expoConfig?.extra as AppConfig)?.supabaseAnonKey,
      geminiApiKey: (Constants.expoConfig?.extra as AppConfig)?.geminiApiKey,
    });

    async function checkSession() {
      try {
        console.log('Initializing session check...');
        const { data, error: sessionError } = await (supabase as AppSupabaseClient).auth.getSession();
        console.log('Session response:', { data, error: sessionError });

        if (sessionError) throw sessionError;

        setSession(data.session);

        if (data.session) {
          console.log('Session found, setting initial screen to (tabs)');
          setInitialScreen('(tabs)'); // Use screen name
          setNestedRoute(null); // No nested route needed for (tabs)
        } else {
          console.log('No session, setting initial screen to auth with nested route /auth/sign-up');
          setInitialScreen('auth'); // Use screen name
          setNestedRoute('/auth/sign-up' as LinkHref); // Navigate to sign-up within auth layout
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Session check failed:', errorMessage);
        setError(errorMessage || 'Failed to connect to Supabase');
        Alert.alert('Connection Error', errorMessage || 'Failed to connect to services');
      } finally {
        setLoading(false);
        console.log('Hiding splash screen');
        await SplashScreen.hideAsync();
      }
    }

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = (supabase as AppSupabaseClient).auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', session);
        setSession(session);
        if (session) {
          setInitialScreen('(tabs)');
          setNestedRoute(null);
        } else {
          setInitialScreen('auth');
          setNestedRoute('/auth/sign-up' as LinkHref);
        }
      }
    );

    // Cleanup subscription
    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Perform nested navigation after the Stack mounts
  useEffect(() => {
    if (!loading && nestedRoute) {
      console.log('Navigating to nested route:', nestedRoute);
      router.replace(nestedRoute);
    }
  }, [loading, nestedRoute]);

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

  // Render the Stack navigator with the correct screen name as initialRouteName
  return (
    <>
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName={initialScreen} // Use screen name: 'auth' or '(tabs)'
      >
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
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