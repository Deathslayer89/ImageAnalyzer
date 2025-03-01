import React from 'react';
import { View, SafeAreaView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { VerifyEmail } from '@/components/auth/VerifyEmail';

export default function VerifyScreen() {
  const { user } = useAuth();
  
  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 justify-center p-6">
        <VerifyEmail email={user?.email} />
      </View>
    </SafeAreaView>
  );
}