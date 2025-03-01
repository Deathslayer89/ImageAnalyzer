// app/auth/sign-in.tsx
import React, { useState } from 'react';
import { View, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';

export default function SignInScreen() {
  const { signIn, error, clearError, isLoading } = useAuth();
  
  const handleSignIn = (data: { email: string; password: string }) => {
    // Non-async wrapper function
    signIn(data.email, data.password).catch((error) => {
      // Error already handled in auth context
    });
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