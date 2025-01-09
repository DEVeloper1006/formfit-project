import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function SignInScreen() {
  const router = useRouter(); // For navigation

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // Redirect to main app (tabs) when "Sign In" is clicked
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#99aab5"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#99aab5"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')} style={styles.toggleLink}>
        <Text style={styles.toggleText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#23272a',
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7289da',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    backgroundColor: '#2c2f33',
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#4f545c',
  },
  button: {
    backgroundColor: '#7289da',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleLink: {
    marginTop: 20,
  },
  toggleText: {
    color: '#99aab5',
    fontSize: 16,
    textAlign: 'center',
  },
});
