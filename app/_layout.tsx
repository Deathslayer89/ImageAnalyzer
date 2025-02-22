import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../lib/supabase';
import React from 'react';
export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);

      if (session) {
        router.replace('/(tabs)'); // Redirect to tabs if signed in
      } else {
        router.replace('/auth/sign-in'); // Redirect to sign-in if signed out
      }
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth routes */}
        <Stack.Screen name="auth" /> {/* Changed from "auth/[...all]" */}
        {/* Tabs routes */}
        <Stack.Screen name="(tabs)" />
        {/* Not found route */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}