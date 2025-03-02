// Create a new file at app/auth/callback.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';

export default function AuthCallbackScreen() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const router = useRouter();
  const params = useLocalSearchParams();
  
  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get the access_token and refresh_token from URL params
        const refreshToken = params.refresh_token as string;
        const accessToken = params.access_token as string;
        
        if (!refreshToken || !accessToken) {
          throw new Error('Verification tokens missing');
        }
        
        // Set the auth session
        const { data, error } = await supabase.auth.setSession({
          refresh_token: refreshToken,
          access_token: accessToken,
        });
        
        if (error) {
          throw error;
        }
        
        setStatus('success');
        setMessage('Email successfully verified!');
        
        // Wait a moment before redirecting to the app
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 2000);
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Email verification failed. Please try again.');
      }
    };
    
    handleEmailVerification();
  }, [params, router]);
  
  return (
    <View className="flex-1 bg-black items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <View className="items-center mb-4">
            {status === 'loading' && (
              <ActivityIndicator size="large" color="#3b82f6" />
            )}
            
            {status === 'success' && (
              <View className="bg-green-500/20 w-16 h-16 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={32} color="#4ade80" />
              </View>
            )}
            
            {status === 'error' && (
              <View className="bg-red-500/20 w-16 h-16 rounded-full items-center justify-center">
                <Ionicons name="close" size={32} color="#ef4444" />
              </View>
            )}
          </View>
          
          <Text className="text-white text-center text-lg mb-4">{message}</Text>
          
          {status === 'error' && (
            <Button
              onPress={() => router.replace('/auth/sign-in')}
              className="mt-4"
            >
              Return to Sign In
            </Button>
          )}
        </CardContent>
      </Card>
    </View>
  );
}