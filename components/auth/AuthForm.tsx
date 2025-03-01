import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../ui/Card';

// Define validation schema
const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthFormData = z.infer<typeof authSchema>;

interface AuthFormProps {
  type: 'sign-in' | 'sign-up';
  onSubmit: (data: AuthFormData) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function AuthForm({ type, onSubmit, isLoading, error }: AuthFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">
          {type === 'sign-in' ? 'Sign In' : 'Create Account'}
        </CardTitle>
        {error && (
          <Text className="text-red-500 text-center text-sm mt-2">{error}</Text>
        )}
      </CardHeader>
      
      <CardContent>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
              icon={<Ionicons name="mail-outline" size={18} color="#888" />}
              disabled={isLoading}
            />
          )}
        />
        
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="relative">
              <Input
                label="Password"
                placeholder="Your password"
                secureTextEntry={!showPassword}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
                icon={<Ionicons name="lock-closed-outline" size={18} color="#888" />}
                disabled={isLoading}
                containerClassName="mb-0"
              />
              <TouchableOpacity 
                onPress={togglePasswordVisibility}
                className="absolute right-3 top-9"
              >
                {showPassword ? (
                  <Ionicons name="eye-off-outline" size={18} color="#888" />
                ) : (
                  <Ionicons name="eye-outline" size={18} color="#888" />
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      </CardContent>
      
      <CardFooter className="flex-col">
        <Button
          className="w-full mb-4"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading}
        >
          {type === 'sign-in' ? 'Sign In' : 'Sign Up'}
        </Button>
        
        <TouchableOpacity
          onPress={() => router.replace(`/auth/${type === 'sign-in' ? 'sign-up' : 'sign-in'}`)}
          className="w-full items-center py-2"
        >
          <Text className="text-blue-500 text-sm">
            {type === 'sign-in'
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </Text>
        </TouchableOpacity>
      </CardFooter>
    </Card>
  );
}