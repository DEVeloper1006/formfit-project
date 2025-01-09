import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function SignUpScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    // Redirect to sign-in after signing up
    router.replace('/(auth)/sign-in');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#99aab5"
        value={name}
        onChangeText={setName}
      />
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
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} style={styles.toggleLink}>
        <Text style={styles.toggleText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',  // Centers the content vertically
    backgroundColor: '#23272a', // Discord-like dark background
    paddingHorizontal: 20,      // Adds padding on left and right
  },
  headerText: {
    fontSize: 32,               // Large header text
    fontWeight: 'bold',         // Bold text
    color: '#7289da',           // Light blue color
    marginBottom: 30,           // Spacing below the header
    textAlign: 'center',        // Center the header text
  },
  input: {
    height: 50,                 // Fixed height for input
    backgroundColor: '#2c2f33', // Darker input background
    borderRadius: 10,           // Rounded corners
    paddingHorizontal: 15,      // Padding inside the input
    color: '#fff',              // White text color inside input
    marginBottom: 15,           // Spacing between inputs
    borderWidth: 1,             // Border width
    borderColor: '#4f545c',     // Subtle border color
  },
  button: {
    backgroundColor: '#7289da', // Blue background for button
    paddingVertical: 15,        // Padding for vertical space
    borderRadius: 10,           // Rounded button corners
    alignItems: 'center',       // Center the text horizontally
  },
  buttonText: {
    color: '#fff',              // White button text
    fontSize: 18,               // Font size for button text
    fontWeight: 'bold',         // Bold button text
  },
  toggleLink: {
    marginTop: 20,              // Spacing above the "Already have an account?" link
  },
  toggleText: {
    color: '#99aab5',           // Greyish text color for the link
    fontSize: 16,               // Font size for the link text
    textAlign: 'center',        // Center-align the link text
  },
});
