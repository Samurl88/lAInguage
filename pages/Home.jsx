import { View, Text, Pressable, SafeAreaView, StyleSheet } from 'react-native'
import React from 'react'
import auth from '@react-native-firebase/auth';

export default function HomePage({ navigation }) {

  function logOut() {
    auth()
    .signOut()
  }

  return (
    <SafeAreaView>
      <Text>HomePage</Text>
      <Pressable onPress={() => {navigation.navigate("Debug")}}>
        <Text>Go to debug</Text>
      </Pressable>
      <Pressable onPress={() => {navigation.navigate("Camera")}}>
        <Text>Go to camera</Text>
      </Pressable>

      <Pressable onPress={logOut}>
        <Text>
          Log out
        </Text>
      </Pressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  
})