import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';

export default function SignUpScreen() {
  const { signUp, isLoaded } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);

  const handleSignUp = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      console.error('Sign-up error:', err);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      if (completeSignUp.status === 'complete') {
        router.replace('/');
      } else {
        console.error('Verification incomplete:', completeSignUp);
      }
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  return (
    <View>
      {!pendingVerification ? (
        <>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Sign Up" onPress={handleSignUp} />
        </>
      ) : (
        <>
          <TextInput
            placeholder="Verification Code"
            value={code}
            onChangeText={setCode}
          />
          <Button title="Verify" onPress={handleVerify} />
        </>
      )}
    </View>
  );
}
