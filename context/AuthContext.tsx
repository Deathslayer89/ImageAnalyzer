// context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true);
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error(`Session error: ${sessionError.message}`);
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Auth initialization error:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    initializeSession();
  }, []);

  // Handle navigation based on session changes
  useEffect(() => {
    if (!isLoading) { // Only navigate after loading is complete
      if (session) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth/sign-in');
      }
    }
  }, [session, isLoading]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log(`Auth event: ${event}`);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        // Navigation is now handled in the useEffect above
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      router.replace('/auth/verify');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up';
      console.error('Sign up error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      console.error('Sign in error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      console.error('Sign out error:', errorMessage);
      setError(errorMessage);
      Alert.alert('Sign Out Error', 'Unable to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};