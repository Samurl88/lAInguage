import { View, Text, Pressable, SafeAreaView, StyleSheet, Image, Dimensions, FlatList } from 'react-native'
// import React from 'react'
import auth from '@react-native-firebase/auth';
import React, { useEffect, useRef, useState } from 'react'
import Dictionary from './Dictionary';
import { SFSymbol } from 'react-native-sfsymbols';
import CameraPage from './Camera';
import StudyPage from './Study';
import Animated, { SlideInDown, SlideInRight, SlideInUp, SlideOutRight, SlideOutUp } from 'react-native-reanimated';

import database from '@react-native-firebase/database';

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

export default function HomePage({ navigation }) {
  const [cameraPage, setCameraPage] = useState(true)
  const [studyPage, setStudyPage] = useState(false)
  const [dictionaryPage, setDictionaryPage] = useState(false)

  const [userLanguage, setUserLanguage] = useState(null)

  useEffect(() => {
    let uid = auth().currentUser.uid;
    database()
    .ref(`${uid}/`)
    .once('value')
    .then(snapshot => {
      let data = snapshot.val()

      let lang = data.language
      // console.log(lang)
      setUserLanguage(lang)
      })}, [])

  function logOut() {
    auth()
      .signOut()
  }
  const bottomSheetRef = useRef(null)


  // logOut()

  function openTextSheet() {
    bottomSheetRef.current.snapToIndex(0);
  }
  


  if (userLanguage)
  return (
    <View style={{flex: 1, backgroundColor: "#F0E8DD"}}>
      <View style={styles.tabBar}>
        <Pressable style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center", }} onPress={() => {
          setCameraPage(true)
          setStudyPage(false)
          setDictionaryPage(false)
        }}>
          <SFSymbol name="camera.fill" size={18} color="#2F2C2A" style={{ opacity: cameraPage ? 1 : 0.21 }} />
        </Pressable>
        <Pressable style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center", }} onPress={() => {
          setCameraPage(false)
          setStudyPage(true)
          setDictionaryPage(false)
        }}>
          <SFSymbol name="doc.on.doc.fill" size={18} color="#2F2C2A" style={{ opacity: studyPage ? 1 : 0.21 }} />
        </Pressable>
        <Pressable style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center", }} onPress={() => {
          setCameraPage(false)
          setStudyPage(false)
          setDictionaryPage(true)
        }}>
          <SFSymbol name="character.book.closed.fill" size={18} color="#2F2C2A" style={{ opacity: dictionaryPage ? 1 : 0.21 }} />
        </Pressable>
      </View>

      {cameraPage &&
        <Animated.View entering={SlideInDown} exiting={SlideOutUp} style={{ flex: 1 }}>
          <CameraPage language={userLanguage} />
        </Animated.View>
      }
      {studyPage &&
        <Animated.View entering={SlideInDown} exiting={SlideOutUp} style={{ flex: 1 }}>
        <StudyPage language={userLanguage} />
        </Animated.View>
      }
      {dictionaryPage &&
        <Animated.View entering={SlideInDown} exiting={SlideOutUp} style={{ flex: 1 }}>
        <Dictionary language={userLanguage} />
        </Animated.View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    position: "absolute",
    zIndex: 100,
    top: screenHeight * 0.07,
    justifyContent: "center",
    alignSelf: "center",
    flexDirection: "row",
    borderRadius: 60,
    paddingLeft: 10,
    paddingRight: 10,
  },
})

{/* <Text>HomePage</Text>
      <Pressable onPress={() => { navigation.navigate("Debug") }}>
        <Text>Go to debug</Text>
      </Pressable>
      <Pressable onPress={() => { navigation.navigate("Camera") }}>
        <Text>Go to camera</Text>
      </Pressable>

      <Pressable onPress={() => { navigation.navigate("Study") }}>
        <Text>Go to study</Text>
      </Pressable>

      <Pressable onPress={() => { navigation.navigate("Dictionary") }}>
        <Text>Go to dictionary</Text>
      </Pressable>

      <Pressable onPress={logOut}>
        <Text>
          Log out
        </Text>
      </Pressable> */}
{/* <Image src={image}></Image> */ }