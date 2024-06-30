import { View, Text, SafeAreaView, Pressable, StyleSheet, FlatList, Dimensions, Image } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import Animated, {useSharedValue, interpolate, useAnimatedStyle, withTiming} from 'react-native-reanimated';

import auth from '@react-native-firebase/auth';
import database from "@react-native-firebase/database"


const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

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
        flashcards.push({front: word, back: words[word]["translatedDefinition"] })
        console.log(flashcards)
        console.log("Eedvrg")
        setFlashcards(flashcards)
      }

    })
  }

  useEffect(() => {
    createFlashcards()
  }, [])
  

  const ref = useRef()

  return (
    <SafeAreaView style={{justifyContent: "center", alignItems: "center"}}>

      <Text>StudyPage</Text>
      <Pressable style={styles.debugButton} onPress={createFlashcards}>
        <Text>Create flashcards</Text>
        </Pressable>
      {flashcards.length 
      ? 
        <FlatList
        data={flashcards}
        ref={ref}
        // onMomentumScrollEnd={updateCurrentSlideIndex}
        horizontal
        renderItem={({ item }) => {
          console.log(item)
          return(<Flashcard front={item?.front} back={item?.back} />)}}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item?.front}
        style={{ zIndex: 100, }}
     />

    : null }
    </SafeAreaView>
  )
}

function Flashcard({ front, back }) {

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
    <View style={{width: screenWidth, justifyContent: "center", alignItems: "center"}}>
        <Animated.View style={[styles.front, frontAnimatedStyle]}>
        <Pressable onPress={() => (spin.value = spin.value ? 0 : 1)} style={{width: "100%", height: "100%", alignItems: "center", justifyContent: "center"}}>
          <Text>{front}</Text>
        </Pressable>
      </Animated.View>
      <Animated.View onPress={() => (spin.value = spin.value ? 0 : 1)} style={[styles.back, backAnimatedStyle]}>
      <Pressable onPress={() => (spin.value = spin.value ? 0 : 1)} style={{width: "100%", height: "100%", alignItems: "center", justifyContent: "center"}}>
          <Text>{back}</Text>
        </Pressable>
      </Animated.View>
    </View>
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
    // top: 200,

 },
 back: {
    height: 250,
    width: 350,
    backgroundColor: "#FF8787",
    borderRadius: 16,
    backfaceVisibility: "hidden",
    alignItems: "center",
    justifyContent: "center",
    // top: 200
 },
})