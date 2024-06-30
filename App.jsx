import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from "./pages/Home"
import DebugPage from "./pages/Debug"
import StudyPage from "./pages/Study"
import CameraPage from "./pages/Camera"
import SignUp from './pages/SignUp';
import DictionaryPage from './pages/Dictionary';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications

import auth from '@react-native-firebase/auth';

const Stack = createStackNavigator();

export default function App() {

  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    console.log(user)
    if (initializing) setInitializing(false);
  }


  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false, }}>
          {user
            ? <>
              <Stack.Screen name="Home" component={HomePage} />
              {/* <Stack.Screen name="Debug" component={DebugPage} />
              <Stack.Screen name="Camera" component={CameraPage} />
              <Stack.Screen name="Study" component={StudyPage} />
              <Stack.Screen name="Dictionary" component={DictionaryPage} /> */}
            </>
            : <>
              <Stack.Screen name="SignUp" component={SignUp} />
            </>
          }

        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
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