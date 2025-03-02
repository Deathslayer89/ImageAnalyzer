import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const supabaseUrl = 
  Constants.expoConfig?.extra?.supabaseURL || 
  process.env.EXPO_PUBLIC_SUPABASE_URL || 
  'https://your-project.supabase.co';

const supabaseAnonKey = 
  Constants.expoConfig?.extra?.supabaseAnonKey || 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  'your-anon-key';

let supabase;

try {
  if (__DEV__) {
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

  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // Enable this to handle deep links properly
    },
  });
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  throw new Error('Could not connect to database. Please check your internet connection.');
}

export { supabase };