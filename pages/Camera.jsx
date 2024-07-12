import { View, Text, SafeAreaView, StyleSheet, Button, Dimensions, Pressable, ActivityIndicator, FlatList, Alert } from 'react-native'
import { useCameraDevice, useCameraPermission, Camera } from 'react-native-vision-camera'
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useImage, Image, CornerPathEffect, topRight } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import { Canvas, Path, useCanvasRef, Picture } from "@shopify/react-native-skia";
import { Extrapolation, FadeIn, FadeOut, interpolate, runOnJS, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { SFSymbol } from 'react-native-sfsymbols';
import Config from 'react-native-config';
import Animated from 'react-native-reanimated';
import Svg, { Path as PathSvg, Defs, LinearGradient, Stop, Circle } from "react-native-svg"


import auth from '@react-native-firebase/auth';
import database from "@react-native-firebase/database"
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

import { launchImageLibrary } from 'react-native-image-picker';

import RNFS from 'react-native-fs'
import ContextMenu from 'react-native-context-menu-view';
import Tts from 'react-native-tts';

const dayjs = require('dayjs')

languageToId = {
  "arabic": { "identifier": "com.apple.ttsbundle.Maged-compact" },
  "czech": { "identifier": "com.apple.ttsbundle.Zuzana-compact" },
  "danish": { "identifier": "com.apple.ttsbundle.Sara-compact" },
  "german": { "identifier": "com.apple.ttsbundle.Anna-compact" },
  "greek": { "identifier": "com.apple.ttsbundle.Melina-compact" },
  "english": { "identifier": "com.apple.ttsbundle.Samantha-compact" },
  "spanish": { "identifier": "com.apple.ttsbundle.Monica-compact" },
  "finnish": { "identifier": "com.apple.ttsbundle.Satu-compact" },
  "french": { "identifier": "com.apple.ttsbundle.Thomas-compact" },
  "hebrew": { "identifier": "com.apple.ttsbundle.Carmit-compact" },
  "hindi": { "identifier": "com.apple.ttsbundle.Lekha-compact" },
  "hungarian": { "identifier": "com.apple.ttsbundle.Mariska-compact" },
  "indonesian": { "identifier": "com.apple.ttsbundle.Damayanti-compact" },
  "italian": { "identifier": "com.apple.ttsbundle.Alice-compact" },
  "japanese": { "identifier": "com.apple.ttsbundle.Kyoko-compact" },
  "korean": { "identifier": "com.apple.ttsbundle.Yuna-compact" },
  "dutch": { "identifier": "com.apple.ttsbundle.Xander-compact" },
  "norwegian": { "identifier": "com.apple.ttsbundle.Nora-compact" },
  "polish": { "identifier": "com.apple.ttsbundle.Zosia-compact" },
  "portuguese": { "identifier": "com.apple.ttsbundle.Luciana-compact" },
  "romanian": { "identifier": "com.apple.ttsbundle.Ioana-compact" },
  "russian": { "identifier": "com.apple.ttsbundle.Milena-compact" },
  "slovak": { "identifier": "com.apple.ttsbundle.Laura-compact" },
  "swedish": { "identifier": "com.apple.ttsbundle.Alva-compact" },
  "thai": { "identifier": "com.apple.ttsbundle.Kanya-compact" },
  "turkish": { "identifier": "com.apple.ttsbundle.Yelda-compact" },
  "chinese": { "identifier": "com.apple.ttsbundle.Ting-Ting-compact" }
}

const speedToRate = [0.2, 0.4, 0.6]

export default function CameraPage({ language, translations, terms, toDictionaryPage, wordSpeed }) {
  const device = useCameraDevice('back')

  const genAI = new GoogleGenerativeAI(Config.API_KEY);

  const [originalWord, setOriginalWord] = useState(null)
  const [originalDefinition, setOriginalDefinition] = useState(null)
  const [translatedWord, setTranslatedWord] = useState(null)
  const [translatedDefinition, setTranslatedDefinition] = useState(null)
  const [originalLanguage, setOriginalLanguage] = useState(null)
  const [loading, setLoading] = useState(false)

  const safetySetting = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySetting, generationConfig: { responseMimeType: "application/json" } },);

  const addWord = (originalWord, originalDefinition, translatedWord, translatedDefinition, originalLanguage) => {
    setInitialized(true)
    const uid = auth().currentUser.uid;
    database()
      .ref(`/${uid}/words`)
      .update({
        [originalWord]: {
          translatedWord: translatedWord,
          definition: originalDefinition,
          translatedDefinition: translatedDefinition,
          originalLanguage: originalLanguage,
          score: 0,
          date: JSON.stringify(dayjs())
        }
      })
      .then(() => console.log("Done!")).catch(error => {
        console.error("Failed to add word to database:", error);
      });

  }

  const define = async (imageData) => {
    console.log("WE GOT TO DEFINE")
    const prompt = `
    Attached is a photo. If there is a word highlighted in blue, determine the root word/infinitive of the highlighted word in the image (ex. leaving -> leave; vendieron -> vender).
    Provide the word and definition in the original language of the word as well as the original language (its name in english, ex. spanish -> spanish); additionally, provide the word and definition in ${language}. 
    Definitions should be 12 words or less. Everything must be lowercase. 
    Use the JSON schema below. If you cannot detect a word highlighted in blue, return null for all values.
    { "originalLanguage": "string",
      "originalWord": "string",
      "originalDefinition": "string", 
      "translatedWord": "string",
      "translatedDefinition": "string"
    }`

    const result = await model.generateContent([prompt, { inlineData: { data: imageData, mimeType: 'image/png' } }]);
    const response = result.response;
    const text = JSON.parse(response.text());

    // If word is detected
    if (!(text.originalDefinition == null || text.originalDefinition == "null")) {
      setOriginalWord(text.originalWord)
      setOriginalDefinition(text.originalDefinition)
      setTranslatedWord(text.translatedWord)
      setTranslatedDefinition(text.translatedDefinition)
      setOriginalLanguage(text.originalLanguage)
      if (terms && Object.keys(terms).includes(text.originalWord)) {
        Alert.alert("Word already scanned!", "Please check your dictionary.", [
          {
            text: 'OK'
          }
        ])
      } else {
        addWord(text.originalWord, text.originalDefinition, text.translatedWord, text.translatedDefinition, text.originalLanguage);
        openTextSheet();
      }
    } else {
      Alert.alert("No word was detected!", "Please try again.", [
        {
          text: 'OK'
        }
      ])
    }
    setLoading(false)
  }

  const [words, setWords] = useState([])

  function sortTerms() {
    let words = []
    for (const word in terms) {
      let obj = terms[word]
      obj.word = word
      words.push(obj)
    }

    // Sort terms by date
    words = words.sort((a, b) => {
      return dayjs(JSON.parse(a.date)).isAfter(dayjs(JSON.parse(b.date))) ? -1 : 1
    })

    // Remove most recent word (to be animated in header instead)
    // words.shift()

    setWords(words)
  }

  // Sort terms on start
  const [initialized, setInitialized] = useState(false)
  useEffect(() => {
    if (!initialized && terms) {
      sortTerms()
      setInitialized(true)
    }
  }, [terms])

  const bottomSheetRef = useRef(null)


  function openTextSheet() {
    bottomSheetRef.current.snapToIndex(0);
  }




  const [paths, setPaths] = useState([]);
  const canvasRef = useCanvasRef();


  const camera = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(true);
  const [image, setImage] = useState(null);
  const [loadedImage, setLoadedImage] = useState(null)
  const { hasPermission, requestPermission } = useCameraPermission()

  const [currentPosition, setCurrentPosition] = useState(-1)

  const [flash, setFlash] = useState('off')

  const saveMarkedUpImage = async () => {
    setLoading(true)
    const image = await canvasRef.current.makeImageSnapshotAsync();
    const bytes = image.encodeToBase64();
    define(bytes)

  };

  // onBegin will allow only one stroke
  const pan = Gesture.Pan()
    .onStart((g) => {
      // const newPaths = [];
      const newPaths = [...paths]
      // console.log(newPaths)
      newPaths[paths.length] = {
        segments: [],
        color: "#77bee9",
      };
      newPaths[paths.length].segments.push(`M ${g.x} ${g.y}`);
      runOnJS(setPaths)(newPaths);
    })
    .onUpdate((g) => {
      const index = paths.length - 1;
      const newPaths = [...paths];
      if (newPaths?.[index]?.segments) {
        newPaths[index].segments.push(`L ${g.x} ${g.y}`);
        runOnJS(setPaths)(newPaths);
      }
    })
    .onEnd((g) => {
      console.log("Done")
    }
    )
    .minDistance(1)

  useEffect(() => {
    if (!hasPermission)
      requestPermission()
  }, [])

  useEffect(() => {
    if (image) {
      const data = Skia.Data.fromBase64(image);
      const newImage = Skia.Image.MakeImageFromEncoded(data);
      setLoadedImage(newImage)
      setCameraOpen(false)
    }
  }, [image])


  const firstTermOpacity = useSharedValue(1)
  const firstTermHeight = useSharedValue(screenHeight * 0.16)
  const firstMarginTop = useSharedValue(12)


  const rotate = useSharedValue("0deg")
  const opacity = useSharedValue(0)
  useEffect(() => {
    if (loading) {
      rotate.value = withRepeat(withTiming("360deg", { duration: 1000, }), -1)
      opacity.value = withTiming(1, { duration: 500 })
    } else {
      rotate.value = "0deg"
      opacity.value = 0
    }
  }, [loading])

  if (hasPermission)
    return (
      <>
        <View style={{ backgroundColor: "black", flex: 1 }}>
          {!loadedImage ?
            <>
              {/* <Camera
                ref={camera}
                style={{ width: screenWidth, height: screenHeight, position: "absolute" }}
                device={device}
                isActive={true}
                photo={true}
                enableZoomGesture={true}
              /> */}

              <Animated.View style={styles.buttonContainer} key="buttonContainer1" entering={FadeIn.duration(250).delay(250)}>
                <Pressable style={({ pressed }) => [styles.actionButton, { backgroundColor: pressed ? "#4A4643" : "#2F2C2A" }]} onPress={() => {
                  if (flash == "on") setFlash("off")
                  else setFlash("on")
                }}>
                  <SFSymbol name={flash == "on" ? "bolt.fill" : "bolt.slash.fill"} size={25} color="white" />
                </Pressable>
                <Pressable onPress={async () => {
                  const photo = await camera.current.takePhoto({
                    flash: flash
                  });
                  RNFS.readFile(photo.path, 'base64').then(result => {
                    setImage(result)
                  })
                }}>
                  {({ pressed }) => (
                    <Svg
                      width={80}
                      height={80}
                      viewBox="0 0 72 72"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <Circle cx={36} cy={36} r={30} fill={pressed ? "#C9C3BC" : "#F0E8DD"} />
                      <Circle cx={36} cy={36} r={34.5} stroke={pressed ? "#C9C3BC" : "#F0E8DD"} strokeWidth={3} />
                    </Svg>
                  )}
                </Pressable>
                <Pressable style={({ pressed }) => [styles.actionButton, { backgroundColor: pressed ? "#4A4643" : "#2F2C2A" }]} onPress={() => {
                  launchImageLibrary({ mediaType: "photo", includeBase64: true }, (result) => {
                    if (!result?.didCancel) {
                      let image = result.assets[0].base64
                      setImage(image)
                    }

                  })
                }}>
                  <SFSymbol name="photo.on.rectangle.angled" size={25} color="white" />
                </Pressable>
              </Animated.View>
              <View style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", borderRadius: 10, fontSize: 18, position: "absolute", top: screenHeight * 0.905, alignSelf: "center", }}>
                <Animated.Text entering={FadeIn.duration(250).delay(250)} style={{ fontSize: 18, color: "white", textShadowColor: 'rgba(0, 0, 0, 1)', textShadowRadius: 10, padding: 10 }}>{translations.capture_text_to_translate[language]}</Animated.Text>
              </View>
            </>
            : <>
              {/* entering={FadeIn.duration(500).delay(500)} */}
              <Animated.View style={styles.buttonContainer} key="buttonContainer2" exiting={FadeOut.duration(250)}>
                <Pressable style={({ pressed }) => [styles.actionButton, { backgroundColor: pressed ? "#4A4643" : "#2F2C2A" }]} onPress={() => {
                  setPaths([])
                  setCameraOpen(true);
                  setImage(null);
                  setLoadedImage(null);
                }}>
                  <Animated.View>
                    <SFSymbol name="arrow.triangle.2.circlepath.camera.fill" size={24} color="white" />
                  </Animated.View>
                </Pressable>
                <Pressable onPress={() => {
                  if (!loading && paths.length) saveMarkedUpImage()
                }} style={({ pressed }) => [styles.bigActionButton, { backgroundColor: pressed ? "#67A4C9" : "#77bee9" }]} opacity={paths.length ? 1 : 0.5}>
                  {!loading
                    ? <SFSymbol name="doc.text.magnifyingglass" size={32} color="black" />
                    : <Animated.View style={{ transform: [{ rotate: rotate }], opacity: opacity }}>
                      <SFSymbol name="sparkle" size={40} color="gray" />
                    </Animated.View>
                  }
                </Pressable>
                <Pressable style={({ pressed }) => [styles.actionButton, { backgroundColor: pressed ? "#4A4643" : "#2F2C2A" }]} onPress={() => { setPaths([]) }}>
                  <Animated.View>
                    <SFSymbol name="eraser.fill" size={25} color="white" />
                  </Animated.View>
                </Pressable>
              </Animated.View>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <GestureDetector gesture={pan}>
                  <View style={{ flex: 1, position: 'absolute', width: screenWidth, height: screenHeight }}>
                    <Canvas style={styles.canvas} ref={canvasRef}>
                      <Image image={loadedImage} fit="cover" x={0} y={0} width={screenWidth} height={screenHeight} />
                      {paths.map((p, index) => (
                        <Path
                          key={index}
                          path={p?.segments.join(" ") ? p.segments.join(" ") : " "}
                          strokeWidth={30}
                          style="stroke"
                          color={p?.color}
                          opacity={0.5}
                          strokeCap="round"
                        >
                          <CornerPathEffect r={600004} />
                        </Path>
                      ))}
                    </Canvas>

                    <View style={{ ...StyleSheet.absoluteFill, position: "absolute", zIndex: 100 }}>
                      <View style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", borderRadius: 10, fontSize: 18, position: "absolute", top: screenHeight * 0.905, alignSelf: "center", }}>
                        <Animated.Text exiting={FadeOut.duration(250)} style={{ fontSize: 18, color: "white", textShadowColor: 'rgba(0, 0, 0, 1)', textShadowRadius: 10, padding: 10 }}>{translations.highlight_text_to_translate[language]}.</Animated.Text>
                      </View>
                    </View>
                  </View>

                </GestureDetector>
              </GestureHandlerRootView>
            </>
          }
        </View>
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={["33%", "80%"]}
          index={-1}
          backgroundStyle={{ backgroundColor: "#F5EEE5" }}
          enablePanDownToClose={true}
          onChange={index => {
            setCurrentPosition(index)

          }}
          onAnimate={(fromIndex, toIndex) => {
            if (fromIndex == -1) {
              firstTermOpacity.value = withSequence(withTiming(0, { duration: 0 }), withDelay(750, withTiming(1, { duration: 500 })))
              firstTermHeight.value = withSequence(withTiming(0, { duration: 0 }), withTiming(screenHeight * 0.16, { duration: 750 }))
              firstMarginTop.value = withSequence(withTiming(0, { duration: 0 }), withTiming(12, { duration: 750 }))
            } else if (toIndex == -1) {
              sortTerms();
            }
          }}
        >
          <BottomSheetView style={styles.contentContainer}>
            <View style={{ flexDirection: "row", paddingTop: 15, width: "90%", alignItems: "center", justifyContent: "space-between", alignSelf: "center" }}>
              <Text style={styles.title}>{translations.definitions[language]}</Text>
              <Pressable style={({ pressed }) => [{ flexDirection: "row", gap: 10, backgroundColor: pressed ? "#67A4C9" : "#77BEE9", padding: 10, justifyContent: "center", alignItems: "center", borderRadius: 10, shadowColor: "#77BEE9", shadowOpacity: 0.7, shadowRadius: 5, }]} onPress={toDictionaryPage}>
                <SFSymbol name="character.book.closed.fill" size={20} color="white" height={20} width={20} />
                <SFSymbol name="chevron.right" size={20} color="white" height={20} width={20} />
              </Pressable>
            </View>
            <FlatList
              data={words}
              contentContainerStyle={{ paddingBottom: 30, alignSelf: "center", marginTop: 20 }}
              renderItem={({ item }) => {
                return (<Term word={item.word} translatedWord={item.translatedWord} translatedDefinition={item.translatedDefinition} originalLanguage={item.originalLanguage} wordSpeed={wordSpeed} />)
              }}
              ListHeaderComponent={
                <FirstTerm word={originalWord} translatedWord={translatedWord} translatedDefinition={translatedDefinition} firstTermOpacity={firstTermOpacity} firstTermHeight={firstTermHeight} firstMarginTop={firstMarginTop} originalLanguage={originalLanguage} wordSpeed={wordSpeed} />
              }
              style={{ paddingBottom: 50 }}
            />
          </BottomSheetView>
        </BottomSheet>
      </>

    )
}


function FirstTerm({ word, translatedWord, translatedDefinition, firstTermOpacity, firstTermHeight, firstMarginTop, originalLanguage, wordSpeed }) {

  const [inProgress, setInProgress] = useState(false)

  useEffect(() => {
    Tts.setIgnoreSilentSwitch("ignore");
    Tts.addEventListener('tts-start', () => {
      setInProgress(true);
    });
    Tts.addEventListener('tts-finish', () => setInProgress(false));
  }, [])

  return (
    <Animated.View key={word} style={{ opacity: firstTermOpacity, height: firstTermHeight, marginTop: firstMarginTop }}>
      <ContextMenu
        actions={[{ title: "Remove term", destructive: true, systemIcon: "xmark" }]}
        onPress={async (e) => {
          if (e.nativeEvent.name == "Remove term") {
            firstTermOpacity.value = withTiming(0, { duration: 750 })
            firstTermHeight.value = withDelay(750, withTiming(0, { duration: 750 }))
            firstMarginTop.value = withDelay(750, withTiming(0, { duration: 750 }))

            let uid = auth().currentUser.uid;
            database()
              .ref(`${uid}/words/${word}`)
              .set(null)
          }
        }}
      >
        <View style={{ ...styles.termContainer, }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", width: "95%", paddingBottom: 12, alignItems: "center" }}>
            <Text style={styles.termTitle}>{word}</Text>
            <Pressable style={{ justifyContent: "center", alignItems: "center", width: 30, height: 30, right: -10 }} onPress={() => {
              if (!inProgress)
                Tts.speak(word, {
                  iosVoiceId: languageToId[originalLanguage].identifier,
                  rate: wordSpeed != undefined ? speedToRate[wordSpeed] : 0.4
                });
            }}>
              <SFSymbol name="speaker.wave.2.fill" size={20} color="#77BEE9" opacity={inProgress ? 0.5 : 1} />
            </Pressable>
          </View>
          <Text style={styles.termSubtitle}>{translatedWord} · {translatedDefinition}</Text>
        </View>
      </ContextMenu>
    </Animated.View>
  )
}

function Term({ word, translatedWord, translatedDefinition, originalLanguage, wordSpeed }) {
  const termOpacity = useSharedValue(1)
  const termHeight = useSharedValue(screenHeight * 0.16)
  const marginTop = useSharedValue(12)

  const [inProgress, setInProgress] = useState(false)

  useEffect(() => {
    Tts.setIgnoreSilentSwitch("ignore");
    Tts.addEventListener('tts-start', () => {
      setInProgress(true);
    });
    Tts.addEventListener('tts-finish', () => setInProgress(false));
  }, [])

  return (
    <Animated.View key={word} style={{ opacity: termOpacity, height: termHeight, marginTop: marginTop }}>
      <ContextMenu
        actions={[{ title: "Remove term", destructive: true, systemIcon: "xmark" }]}
        onPress={async (e) => {
          if (e.nativeEvent.name == "Remove term") {
            termOpacity.value = withTiming(0, { duration: 750 })
            termHeight.value = withDelay(750, withTiming(0, { duration: 750 }))
            marginTop.value = withDelay(750, withTiming(0, { duration: 750 }))

            let uid = auth().currentUser.uid;
            database()
              .ref(`${uid}/words/${word}`)
              .set(null)

          }
        }}
      >
        <View style={{ ...styles.termContainer, }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", width: "95%", paddingBottom: 12, alignItems: "center" }}>
            <Text style={styles.termTitle}>{word}</Text>
            <Pressable style={{ justifyContent: "center", alignItems: "center", width: 30, height: 30, right: -10 }} onPress={() => {
              if (!inProgress)
                Tts.speak(word, {
                  iosVoiceId: languageToId[originalLanguage].identifier,
                  rate: wordSpeed != undefined ? speedToRate[wordSpeed] : 0.4
                });
            }}>
              <SFSymbol name="speaker.wave.2.fill" size={20} color="#77BEE9" opacity={inProgress ? 0.5 : 1} />
            </Pressable>
          </View>
          <Text style={styles.termSubtitle}>{translatedWord} · {translatedDefinition}</Text>
        </View>
      </ContextMenu>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  termContainer: {
    backgroundColor: "white",
    borderRadius: 26,
    padding: 20,
    width: screenWidth * 0.9,
    height: screenHeight * 0.16,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 2,
    shadowColor: "black",
    shadowOpacity: 0.2,
  },
  termTitle: {
    fontFamily: "NewYorkLarge-Regular",
    fontSize: 20,
  },
  termSubtitle: {
    fontSize: 17,
    fontFamily: "SFPro-Regular"
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    fontFamily: "NewYorkLarge-Semibold",
  },
  tabBar: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    position: "absolute",
    zIndex: 100,
    top: screenHeight * 0.07,
    justifyContent: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: 35,
    borderRadius: 60,

    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 25,
    paddingRight: 25
  },
  drawingContainer: {
    flex: 1,
    position: 'relative',
  },
  backgroundContainer: {
    backgroundColor: "green",
    flex: 1,
    height: "100%"
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    resizeMode: 'contain',
    zIndex: 1,
  },
  canvas: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  languageText: {
    fontFamily: 'SFProRounded-Bold',
    color: "white",
    fontSize: 23,
  },
  actionButton: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F2C2A",
    borderRadius: 25,
  },
  bigActionButton: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#77bee9",
    borderRadius: 40,
  },
  buttonContainer: {
    position: "absolute",
    top: screenHeight * 0.78,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
    zIndex: 100000
  },
})

