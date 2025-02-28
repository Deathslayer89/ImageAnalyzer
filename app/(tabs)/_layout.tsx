import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text, View, Alert, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

export default function TabLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check initial session
  const initializeSession = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw new Error(`Session fetch error: ${error.message}`);

      setIsAuthenticated(!!session);
      if (!session) {
        console.log('No initial session, redirecting to auth');
        router.replace('/auth/sign-up');
      }
    } catch (err: any) {
      console.error('Initialization failed:', err.message);
      setAuthError(err.message || 'Failed to initialize session');
      setIsAuthenticated(false);
    }
  };

  // Handle auth state changes
  const setupAuthListener = () => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const isLoggedIn = !!session;
      setIsAuthenticated(isLoggedIn);
      console.log(
        `Auth event: ${event}, Session: ${isLoggedIn ? 'Active' : 'Inactive'}`
      );
      if (!isLoggedIn) {
        router.replace('/auth/sign-up');
      }
    });
    return () => {
      console.log('Unsubscribing from auth listener');
      subscription.unsubscribe();
    };
  };

  useEffect(() => {
    initializeSession();
    const cleanup = setupAuthListener();
    return cleanup;
  }, []);

  // Sign out handler
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(`Sign out error: ${error.message}`);
      console.log('Signed out successfully');
      router.replace('/auth/sign-up');
    } catch (err: any) {
      console.error('Sign out failed:', err);
      Alert.alert('Sign Out Error', 'Unable to sign out. Please try again.');
    }
  };

  // Render based on auth state
  if (isAuthenticated === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (authError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Something went wrong</Text>
        <Text style={styles.errorSubtext}>{authError}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.replace('/auth/sign-up')}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isAuthenticated) return null;

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
          <TouchableOpacity onPress={handleSignOut} style={{ marginRight: 15 }}>
            <Ionicons name="log-out" size={24} color="#ffffff" />
          </TouchableOpacity>
        ),
      }}
    >
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