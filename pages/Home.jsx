import { View, Text, Pressable, SafeAreaView, StyleSheet, Image, Dimensions, FlatList } from 'react-native'
// import React from 'react'
import auth from '@react-native-firebase/auth';
import React, { useEffect, useRef, useState } from 'react'
import Dictionary from './Dictionary';
import { SFSymbol } from 'react-native-sfsymbols';
import CameraPage from './Camera';
import StudyPage from './Study';
import Animated, { FadeOut, FadeOutDown, FadeOutLeft, FadeOutRight, SlideInDown, SlideInLeft, SlideInRight, SlideInUp, SlideOutLeft, SlideOutRight, SlideOutUp, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg"
import database from '@react-native-firebase/database';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient as LinearGradientRN } from 'react-native-linear-gradient';

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

export default function HomePage({ navigation }) {
  const [cameraPage, setCameraPage] = useState(true)
  const [studyPage, setStudyPage] = useState(false)
  const [dictionaryPage, setDictionaryPage] = useState(false)

  const [userLanguage, setUserLanguage] = useState(null)
  const [stars, setStars] = useState(null);


  // Subscribe to changes in database
  useEffect(() => {
    let uid = auth().currentUser.uid;
    const onValueChange = database()
      .ref(`${uid}/profile`)
      .on('value', snapshot => {
        console.log("something changed!")
        let data = snapshot.val()
        let lang = data.language
        setUserLanguage(lang)

        let stars = data?.stars ? data.stars : 0
        setStars(stars)

        return () => database().ref(`${uid}/profile`).off('value', onValueChange);
      })
  }, [])

  const rotateStar = useSharedValue("0deg")
  const size = useSharedValue(20)
  const opacity = useSharedValue(0)

  useEffect(() => {
    rotateStar.value = withSequence(withTiming("360deg", { duration: 1000 }), withTiming("0deg", { duration: 0 }))
    size.value = withDelay(250, withSequence(withTiming(30, { duration: 250 }), withTiming(20, { duration: 250 })))
    opacity.value = withSequence(withTiming(1, { duration: 500 }), withDelay(500, withTiming(0, { duration: 500 })))
  }, [stars])

  function logOut() {
    auth()
      .signOut()
  }



  // Variable direction for tab bar screen transitions
  const exitDirection = useSharedValue(null);
  const slideOutLeftAnimation = new SlideOutLeft().build();
  const slideOutRightAnimation = new SlideOutRight().build();

  const slideInLeftAnimation = new SlideInLeft().build();
  const slideInRightAnimation = new SlideInRight().build();

  const CustomExitingAnimation = (values) => {
    'worklet';

    return exitDirection.value === 'left'
      ? slideOutLeftAnimation(values)
      : slideOutRightAnimation(values);
  }

  const CustomEnteringAnimation = (values) => {
    'worklet';

    return exitDirection.value === 'left'
      ? slideInLeftAnimation(values)
      : slideInRightAnimation(values);
  }

  // For extendable tab bar
  const tabBarWidth = useSharedValue(0.5 * screenWidth)
  const edgeOpacity = useSharedValue(0)


  if (userLanguage && stars != null)
    return (
      <View style={{ flex: 1, backgroundColor: "#F0E8DD", }}>
        <Animated.View style={{ ...styles.tabBar, width: tabBarWidth, alignItems: "center", justifyContent: "space-around" }}>
          {!cameraPage
            ? <Animated.View key={"leftone"} exiting={FadeOut} style={{ opacity: edgeOpacity }}>
              <MaskedView
                style={{ }}
                maskElement={
                  <View style={{flexDirection: "row", alignItems: "center", gap: 7, height: 50, width: 50, justifyContent: "center"}}>
                    <Animated.View style={{ transform: [{ "rotate": rotateStar }] }}>
                      <Svg
                        width={17}
                        height={17}
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <Path
                          d="M8.5 17a.694.694 0 01-.485-.188.81.81 0 01-.247-.477 33.306 33.306 0 00-.435-2.447c-.147-.688-.33-1.27-.545-1.748a3.85 3.85 0 00-.792-1.202 3.677 3.677 0 00-1.192-.793c-.477-.204-1.054-.375-1.73-.511a33.305 33.305 0 00-2.384-.4.793.793 0 01-.503-.24A.706.706 0 010 8.5a.69.69 0 01.196-.494.824.824 0 01.494-.248c1.107-.12 2.038-.261 2.793-.426.756-.17 1.377-.404 1.866-.7A3.45 3.45 0 006.54 5.449c.301-.5.542-1.14.724-1.918.182-.78.35-1.737.503-2.874A.81.81 0 018.015.18.713.713 0 018.5 0a.67.67 0 01.468.179c.137.12.222.279.256.477.159 1.137.33 2.095.511 2.874.187.773.431 1.41.732 1.91.301.494.696.889 1.184 1.184.489.296 1.11.529 1.866.7.755.164 1.686.31 2.793.434.193.029.355.111.486.248A.674.674 0 0117 8.5a.674.674 0 01-.204.494.785.785 0 01-.494.24 26.945 26.945 0 00-2.794.443c-.755.164-1.38.395-1.874.69a3.451 3.451 0 00-1.184 1.194c-.295.494-.536 1.13-.724 1.91a30.81 30.81 0 00-.502 2.864.752.752 0 01-.247.477A.664.664 0 018.5 17z"
                          fill="#2F2C2A"
                        />
                      </Svg>
                    </Animated.View>
                    <Animated.Text style={{ fontSize: size, fontFamily: "SFPro-Medium" }}>{stars}</Animated.Text>
                  </View>
                }
              >
                { 
                <Animated.View style={{position: "absolute", zIndex: 1000, opacity: opacity}}>
                  <LinearGradientRN useAngle={true} angle={135} angleCenter={{ x: 0.5, y: 0.5 }}  colors={['#65BAEE', '#FD8DFF']} style={{ width: 50, height: 50, }} start={{ x: 0, y: 1 }} end={{ x: 1, y: 1 }} />
                </Animated.View>
                }
                <View style={{backgroundColor: "black", width: 50, height: 50}}></View>

              </MaskedView>
            </Animated.View>
            : null
          }
          <View style={styles.tabBarIcons}>
            <Pressable style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center", }} onPress={() => {
              setCameraPage(true)
              setStudyPage(false)
              setDictionaryPage(false)
              exitDirection.value = "right"
              tabBarWidth.value = withTiming(0.5 * screenWidth)
              edgeOpacity.value = withTiming(0)
            }}>
              <SFSymbol name="camera.fill" size={18} color="#2F2C2A" style={{ opacity: cameraPage ? 1 : 0.21 }} />
            </Pressable>
            <Pressable style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center", }} onPress={() => {
              setCameraPage(false)
              setStudyPage(true)
              setDictionaryPage(false)
              tabBarWidth.value = withTiming(0.85 * screenWidth)
              edgeOpacity.value = withTiming(1)
            }}>
              <SFSymbol name="rectangle.portrait.on.rectangle.portrait.angled.fill" size={18} color="#2F2C2A" style={{ opacity: studyPage ? 1 : 0.21 }} />
            </Pressable>
            <Pressable style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center", }} onPress={() => {
              setCameraPage(false)
              setStudyPage(false)
              setDictionaryPage(true)
              exitDirection.value = "left"
              tabBarWidth.value = withTiming(0.85 * screenWidth)
              edgeOpacity.value = withTiming(1)
            }}>
              <SFSymbol name="character.book.closed.fill" size={18} color="#2F2C2A" style={{ opacity: dictionaryPage ? 1 : 0.21 }} />
            </Pressable>
          </View>

          {!cameraPage
            ? <Animated.View key={"rightone"} style={{ opacity: edgeOpacity }}>
              <Pressable style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center", }} onPress={() => {
                logOut()
              }}>
                <SFSymbol name="person.crop.circle" size={25} color="#2F2C2A" />
              </Pressable>
            </Animated.View>
            : null
          }

        </Animated.View>

        {cameraPage && false &&
          <Animated.View entering={exitDirection.value ? SlideInLeft : null} exiting={SlideOutLeft} style={{ flex: 1 }}>
            <CameraPage language={userLanguage} />
          </Animated.View>
        }
        {studyPage &&
          <Animated.View entering={CustomEnteringAnimation} exiting={CustomExitingAnimation} style={{ flex: 1 }}>
            <StudyPage language={userLanguage} stars={stars} />
          </Animated.View>
        }
        {dictionaryPage &&
          <Animated.View entering={SlideInRight} exiting={SlideOutRight} style={{ flex: 1 }}>
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
    alignSelf: "center",
    flexDirection: "row",
    borderRadius: 60,

  },
  tabBarIcons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

  }
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