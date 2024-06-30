import { View, Text, SafeAreaView, Pressable, } from 'react-native'
import React, { useState, useEffect } from 'react'
import auth from '@react-native-firebase/auth';


export default function SignUp() {

  const [email, setEmail] = useState("teddyffrrbu@gmail.com");
  const [password, setPassword] = useState("password");

  function signUp(email, password) {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log('User account created & signed in!');
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        }

        console.error(error);
      });
  }


  return (
    <SafeAreaView>
      <Text>SignUp</Text>
      <Pressable onPress={() => signUp(email, password)}>
        <Text>
          Sign Up!!!
        </Text>
      </Pressable>
    </SafeAreaView>
  )
}