// context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message'; // Import Toast

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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log(`Auth event: ${event}`);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
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
      Toast.show({
        type: 'success',
        text1: 'Sign Up Successful',
        text2: 'Please check your email to verify your account.',
        position: 'top',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up';
      console.error('Sign up error:', errorMessage);
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Sign Up Error',
        text2: errorMessage,
        position: 'top',
      });
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
      if (error) {
        if (error.message === 'Invalid login credentials') {
          Toast.show({
            type: 'error',
            text1: 'Login Failed',
            text2: 'Invalid email or password. Please try again.',
            position: 'top',
          });
          return; // Exit without throwing
        } else {
          throw error; // Throw other errors to be caught below
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      console.error('Sign in error:', errorMessage);
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: errorMessage,
        position: 'top',
      });
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