import { View, Text, SafeAreaView, Dimensions } from 'react-native'
import React from 'react'

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

export default function Settings() {
  return (
    <SafeAreaView style={{ justifyContent: "center", alignItems: "center", backgroundColor: "#F5EEE5", height: screenHeight }}>
        <View>
        <Text>Settings</Text>
        </View>
    </SafeAreaView>
  )
}