// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Define the ExpoSecureStoreAdapter for Supabase auth storage
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// Access configuration values with fallbacks
const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseURL || // Note: Match the key case from app.config.js
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://your-project.supabase.co';

const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey || // Note: Match the key case from app.config.js
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'your-anon-key';

// Log configuration for debugging (only in development)
if (__DEV__) {
  console.log('Supabase Configuration:');
  console.log(`URL: ${supabaseUrl.substring(0, 15)}...`); // Partial URL for security
  console.log(`Key defined: ${supabaseAnonKey !== 'your-anon-key'}`);

  if (supabaseUrl === 'https://your-project.supabase.co') {
    console.warn(
      '⚠️ Using fallback Supabase URL. Make sure environment variables are set correctly.'
    );
  }
  if (supabaseAnonKey === 'your-anon-key') {
    console.warn(
      '⚠️ Using fallback Supabase anon key. Make sure environment variables are set correctly.'
    );
  }
}

// Initialize and export the Supabase client
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  throw new Error('Could not connect to database. Please check your internet connection.');
}

export { supabase };