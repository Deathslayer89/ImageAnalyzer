import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../ui/Card';

interface VerifyEmailProps {
  email?: string;
}

export function VerifyEmail({ email }: VerifyEmailProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <View className="items-center mb-4">
          <View className="bg-blue-600/20 w-16 h-16 rounded-full items-center justify-center mb-2">
          <Ionicons name="mail-outline" size={32} color="#3b82f6" />
          </View>
        </View>
        <CardTitle className="text-center">Check Your Email</CardTitle>
        <CardDescription className="text-center mt-2">
          We've sent a verification link to
          {email ? ` ${email}` : ' your email address'}.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Text className="text-gray-400 text-center text-sm mb-4">
          Please check your inbox and click the verification link to complete your registration.
          If you don't see it, check your spam folder.
        </Text>
      </CardContent>
      
      <CardFooter className="flex-col">
        <Button
          variant="outline"
          className="w-full mb-2"
          onPress={() => router.replace('/auth/sign-in')}
        >
          Return to Sign In
        </Button>
        
        <Button
          variant="ghost"
          className="w-full"
          onPress={() => router.replace('/auth/sign-up')}
        >
          Try with a different email
        </Button>
      </CardFooter>
    </Card>
  );
}