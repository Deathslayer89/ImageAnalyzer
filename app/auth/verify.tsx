import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function VerifyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check Your Email</Text>
      <Text style={styles.message}>
        We've sent you a verification link. Please check your email and verify your account.
      </Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.replace("/auth/sign-in")} // Changed to absolute path with replace
      >
        <Text style={styles.buttonText}>Return to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  message: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
    opacity: 0.8,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});