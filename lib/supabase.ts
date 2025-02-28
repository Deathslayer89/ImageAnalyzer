import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// Access configuration values safely with fallbacks
const supabaseUrl = Constants.expoConfig?.extra?.SupabaseURL || 
                   process.env.EXPO_PUBLIC_SUPABASE_URL || 
                   'https://your-project.supabase.co';

const supabaseAnonKey = Constants.expoConfig?.extra?.SupabaseAnonKey || 
                        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                        'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});