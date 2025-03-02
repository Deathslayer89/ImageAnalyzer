// app/auth/sign-up.tsx
import { View, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';

export default function SignUpScreen() {
  const { signUp, error, clearError, isLoading } = useAuth();
  
  const handleSignUp = (data: { email: string; password: string }) => {
    // Non-async wrapper function
    signUp(data.email, data.password).catch((error) => {
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
            type="sign-up"
            onSubmit={handleSignUp}
            isLoading={isLoading}
            error={error}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}