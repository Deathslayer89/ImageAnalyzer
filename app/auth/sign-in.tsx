// app/auth/sign-in.tsx
import React from 'react';
import { View, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';

export default function SignInScreen() {
  const { signIn, error, clearError, isLoading } = useAuth();
  
  const handleSignIn = async (data: { email: string; password: string }) => {
    try {
      await signIn(data.email, data.password);
      // Don't navigate here - the root layout will handle this when session changes
    } catch (error) {
      // Error is already handled in auth context
    }
  };
  
  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center p-6">
          <AuthForm
            type="sign-in"
            onSubmit={handleSignIn}
            isLoading={isLoading}
            error={error}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
