import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from "./pages/HomePage"
import DebugPage from "./pages/DebugPage"
import StudyPage from "./pages/StudyPage"
import CameraPage from "./pages/CameraPage"



const Stack = createStackNavigator();



export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Debug" component={DebugPage} />
        <Stack.Screen name="Camera" component={CameraPage} />
        <Stack.Screen name="Study" component={StudyPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});