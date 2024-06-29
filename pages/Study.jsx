import { View, Text, SafeAreaView, Pressable, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import Animated, {useSharedValue, interpolate, useAnimatedStyle, withTiming} from 'react-native-reanimated';

import auth from '@react-native-firebase/auth';
import database from "@react-native-firebase/database"

export default function StudyPage({ navigation }) {

  const [flashcards, setFlashcards] = useState([])
  
  function createFlashcards() {
    let uid = auth().currentUser.uid;
    let option = "translatedDefinition"
    database()
    .ref(`${uid}/words`)
    .once('value')
    .then(snapshot => {
      let words = snapshot.val()
      
      let flashcards = []
      for (const word in words) {
        flashcards.push({"front": word, "back": words[word]["translatedDefinition"] })
        console.log(flashcards)
      }

    })
  }



  return (
    <SafeAreaView style={{justifyContent: "center", alignItems: "center"}}>
      <Text>StudyPage</Text>
      <Pressable style={styles.debugButton} onPress={createFlashcards}>
        <Text>Create flashcards</Text>
      </Pressable>
      
      <Flashcard />
    </SafeAreaView>
  )
}

function Flashcard() {

  const spin = useSharedValue(0)

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spinVal = interpolate(spin.value, [0, 1], [0, 180]);
    return {
      transform: [
        {
          rotateX: withTiming(`${spinVal}deg`, { duration: 500 }),
        },
      ],
    };
  }, []);

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spinVal = interpolate(spin.value, [0, 1], [180, 360]);
    return {
      transform: [
        {
          rotateX: withTiming(`${spinVal}deg`, { duration: 500 }),
        },
      ],
    };
  }, []);

  return(
    <>
        <Animated.View style={[styles.front, frontAnimatedStyle]}>
        <Pressable onPress={() => (spin.value = spin.value ? 0 : 1)} style={{width: "100%", height: "100%", alignItems: "center", justifyContent: "center"}}>
          <Text>Front View</Text>
        </Pressable>
      </Animated.View>
      <Animated.View onPress={() => (spin.value = spin.value ? 0 : 1)} style={[styles.back, backAnimatedStyle]}>
      <Pressable onPress={() => (spin.value = spin.value ? 0 : 1)} style={{width: "100%", height: "100%", alignItems: "center", justifyContent: "center"}}>
          <Text>Back</Text>
        </Pressable>
      </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({
  debugButton: {
    backgroundColor: "#FFCC32",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginBottom: 20,
    width: "90%"
  },
  front: {
    height: 250,
    width: 350,
    backgroundColor: "#D8D9CF",
    borderRadius: 16,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    top: 200,

 },
 back: {
    height: 250,
    width: 350,
    backgroundColor: "#FF8787",
    borderRadius: 16,
    backfaceVisibility: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 200
 },
})