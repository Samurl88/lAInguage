import { View, Text, Pressable, SafeAreaView, StyleSheet, Image } from 'react-native'
// import React from 'react'
import auth from '@react-native-firebase/auth';
import React, { useEffect, useRef, useState } from 'react'
export default function HomePage({ navigation }) {
  // const [image, setImage] = useState(null);
  function logOut() {
    auth()
      .signOut()
  }

  return (
    <SafeAreaView>
      <Text>HomePage</Text>
      <Pressable onPress={() => { navigation.navigate("Debug") }}>
        <Text>Go to debug</Text>
      </Pressable>
      <Pressable onPress={() => { navigation.navigate("Camera") }}>
        <Text>Go to camera</Text>
      </Pressable>

      <Pressable onPress={logOut}>
        <Text>
          Log out
        </Text>
      </Pressable>
      {/* <Image src={image}></Image> */}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({

})