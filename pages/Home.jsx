import { View, Text, Pressable, SafeAreaView } from 'react-native'
import React from 'react'

export default function HomePage({ navigation }) {
  return (
    <SafeAreaView>
      <Text>HomePage</Text>
      <Pressable onPress={() => {navigation.navigate("Debug")}}>
        <Text>Go to debug</Text>
      </Pressable>
    </SafeAreaView>
  )
}