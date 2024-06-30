import { View, Text, SafeAreaView, Pressable, StyleSheet, FlatList, Dimensions, Image } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import Animated, { useSharedValue, interpolate, useAnimatedStyle, withTiming } from 'react-native-reanimated';

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
          flashcards.push({ front: word, back: words[word]["translatedDefinition"] })
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
    <SafeAreaView style={{ justifyContent: "center", alignItems: "center", backgroundColor: "#F5EEE5", height: screenHeight }}>
      <Image source={{ uri: "https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Item_Primogem.png/revision/latest?cb=20201117071158" }} style={{ width: 35, height: 35, position: "absolute", top: 70, left: 30 }} />
      <Text style={{ position: "absolute", top: 75, fontSize: 22, left: 60 }}>4</Text>
      <Text style={styles.title}>Practice</Text>
      <Image source={{ uri: "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png" }} style={{ width: 35, height: 35, position: "absolute", top: 70, right: 30 }} />
      {/* <Pressable style={styles.debugButton} onPress={createFlashcards}>
        <Text>Create flashcards</Text>
      </Pressable> */}

      {flashcards.length
        ?
        <FlatList
          data={flashcards}
          ref={ref}
          // onMomentumScrollEnd={updateCurrentSlideIndex}
          horizontal
          renderItem={({ item }) => {
            console.log(item)
            return (<Flashcard front={item?.front} back={item?.back} />)
          }}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item?.front}
          style={{ zIndex: 100 }}
        />

        : null}

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

  return (
    <View style={{ width: screenWidth, justifyContent: "center", alignItems: "center" }}>
      <Animated.View style={[styles.front, frontAnimatedStyle]}>
        <Pressable onPress={() => (spin.value = spin.value ? 0 : 1)} style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
          <Text style={styles.cardText}>{front}</Text>
        </Pressable>
      </Animated.View>
      <Animated.View onPress={() => (spin.value = spin.value ? 0 : 1)} style={[styles.back, backAnimatedStyle]}>
        <Pressable onPress={() => (spin.value = spin.value ? 0 : 1)} style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
          <Text style={styles.backText}>{back}</Text>
        </Pressable>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  cardText: {
    fontSize: 70
  },
  backText: {
    fontSize: 30
  },
  title: {
    fontSize: 50,
    position: "absolute",
    top: 125,
  },
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
    backgroundColor: "#FFFCF7",
    borderRadius: 16,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    width: "75%",
    height: "60%",
  },
  back: {
    height: 250,
    width: 350,
    backgroundColor: "#FFFCF7",
    borderRadius: 16,
    backfaceVisibility: "hidden",
    alignItems: "center",
    justifyContent: "center",
    width: "75%",
    height: "60%",

    // top: 200
  },
})