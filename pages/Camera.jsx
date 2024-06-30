import { View, Text, SafeAreaView, StyleSheet, Button, Dimensions, Pressable } from 'react-native'
import { Configuration, PESDK, Tool } from "react-native-photoeditorsdk";
import { useCameraDevice, useCameraPermission, Camera } from 'react-native-vision-camera'
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { useImage, Image } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";
import Config from "react-native-config";
import auth from '@react-native-firebase/auth';
import database from "@react-native-firebase/database";

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import { Canvas, Path, useCanvasRef, Picture } from "@shopify/react-native-skia";
import { runOnJS } from 'react-native-reanimated';
import { SFSymbol } from 'react-native-sfsymbols';


const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

import Svg, { Circle } from "react-native-svg"
// yarn ios--simulator "iPhone 15 Pro"
export default function CameraPage() {
  const genAI = new GoogleGenerativeAI(Config.API_KEY);
  const [englishWord, setEnglishWord] = useState(null)
  const [englishDefinition, setEnglishDefinition] = useState(null)
  const [translatedWord, setTranslatedWord] = useState(null)
  const [translatedDefinition, setTranslatedDefinition] = useState(null)

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
  const [paths, setPaths] = useState([]);
  const canvasRef = useCanvasRef();

  const addWord = (englishWord, englishDefinition, translatedWord, translatedDefinition) => {
    const uid = auth().currentUser.uid;
    database()
      .ref(`/${uid}/words`)
      .update({
        [englishWord]: {
          translatedWord: translatedWord,
          definition: englishDefinition,
          translatedDefinition: translatedDefinition,
          score: 1
        }
      })
      .then(() => console.log("Done!")).catch(error => {
        console.error("Failed to add word to database:", error);
      });
  }

  const define = async (imageData) => {

    console.log(Config.API_KEY)

    const prompt = `
    Given this image.
    Language: "Spanish"
    For the highlighted word in the image and the above language, provide its English definition, its translation in the provided language, and its definition in the provided language. Use this JSON schema:
    { "originalWord": "string",
      "englishDefinition": "string", 
      "translatedWord": "string",
      "translatedDefinition": "string"
    }`

    const result = await model.generateContent([prompt, { inlineData: { data: imageData, mimeType: 'image/png' } }]);
    const response = result.response;
    const text = JSON.parse(response.text());
    console.log(text)
    console.log("response")
    setEnglishWord(text.originalWord)
    setEnglishDefinition(text.englishDefinition)
    setTranslatedWord(text.translatedWord)
    setTranslatedDefinition(text.translatedDefinition)
    addWord(text.originalWord, text.englishDefinition, text.translatedWord, text.translatedDefinition);
    // setEnglishWord(word)
    // setEnglishDefinition(text.englishDefinition)
    // setTranslatedWord(text.translatedWord)
    // setTranslatedDefinition(text.translatedDefinition)

    // setResponse(JSON.stringify(text))
  }

  const camera = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(true);
  const [image, setImage] = useState(null);
  const loadedImage = useImage(image);
  const device = useCameraDevice('back')
  const { hasPermission, requestPermission } = useCameraPermission()

  const saveMarkedUpImage = async () => {
    console.log("sup")
    const image = await canvasRef.current.makeImageSnapshotAsync();
    const bytes = image.encodeToBase64();
    // console.log(bytes)
    define(bytes);
  };

  const [tGestureStart, setTGestureStart] = useState(null);
  const [tGestureMove, setTGestureMove] = useState(null);
  const [tGestureUpdate, setTGestureUpdate] = useState(null);
  const [tGestureEnd, setTGestureEnd] = useState(null);

  const pan = Gesture.Pan()
    .onStart((g) => {
      const newPaths = [...paths];
      newPaths[paths.length] = {
        segments: [],
        color: "yellow",
      };
      newPaths[paths.length].segments.push(`M ${g.x} ${g.y}`);
      runOnJS(setPaths)(newPaths);
      runOnJS(setTGestureStart)(`${Math.round(g.x)}, ${Math.round(g.y)}`);
    })
    .onUpdate((g) => {
      const index = paths.length - 1;
      const newPaths = [...paths];
      if (newPaths?.[index]?.segments) {
        newPaths[index].segments.push(`L ${g.x} ${g.y}`);
        runOnJS(setPaths)(newPaths);
      }
    }).minDistance(1)
  useEffect(() => {
    if (!hasPermission)
      requestPermission()

  }, [])


  if (hasPermission)
    return (
      <View style={styles.backgroundContainer}>
        <View style={styles.tabBar}>
          <SFSymbol name="camera.fill" size={18} color="#2F2C2A" />
          <SFSymbol name="doc.on.doc.fill" size={18} color="#2F2C2A" style={{ opacity: 0.21 }} />
          <SFSymbol name="character.book.closed.fill" size={18} color="#2F2C2A" style={{ opacity: 0.21 }} />
        </View>
        {cameraOpen ?
          <>
            <Camera
              ref={camera}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={true}
              photo={true}
            >
            </Camera>
            <View style={{ flex: 1, }}>
              <View style={styles.buttonContainer}>
                <Pressable style={styles.actionButton}>
                  <SFSymbol name="photo.on.rectangle.angled" size={25} color="white" />
                </Pressable>
                <Pressable onPress={async () => {
                  setCameraOpen(true)
                  const photo = await camera.current.takePhoto();
                  console.log(photo.path)
                  setCameraOpen(false)
                  setImage(photo.path)
                  // highlightPhoto(photo.path)
                }}>
                  <Svg
                    width={80}
                    height={80}
                    viewBox="0 0 72 72"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <Circle cx={36} cy={36} r={30} fill="#F0E8DD" />
                    <Circle cx={36} cy={36} r={34.5} stroke="#F0E8DD" strokeWidth={3} />
                  </Svg>
                </Pressable>
                <Pressable style={styles.actionButton}>
                  <Text style={styles.languageText}>EN</Text>
                </Pressable>
              </View>
            </View>
          </>
          : <>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <GestureDetector gesture={pan}>
                <View style={styles.drawingContainer}>
                  {/* <Image source={{
                  uri: image,
                }} style={styles.image} /> */}

                  <Canvas style={styles.canvas} ref={canvasRef}>
                    {/* {testImg ? */}
                    <Image image={loadedImage} fit="cover" width={400} height={600} />
                    {/* // : <></>} */}
                    {paths.map((p, index) => (
                      <Path
                        key={index}
                        path={p.segments.join(" ")}
                        strokeWidth={30}
                        style="stroke"
                        color={p.color}
                        opacity={0.5}
                      />

                    ))}

                    {/* <Picture image={loadedImage}></Picture> */}
                  </Canvas>
                  {/* {loadedImage ? <Text>stuff {String(loadedImage)}</Text> : <Text>Idk error i guess</Text>} */}
                </View>

              </GestureDetector>
              <Text style={styles.title}>
                Definition
              </Text>
              <View style={styles.defBox}>


                <Text
                  style={{ fontSize: 24 }}
                >{`${englishWord}`}</Text>
                <Text
                  style={{ color: "white", fontSize: 24 }}
                >{`English Definition:  ${englishDefinition}`}</Text>
                <Text
                  style={{ color: "white", fontSize: 24 }}
                >{`Translated Word:  ${translatedWord}`}</Text>
                <Text
                  style={{ color: "white", fontSize: 24 }}
                >{`Translated Definition:  ${translatedDefinition}`}</Text>
              </View>
            </GestureHandlerRootView>
            {/* <Button title="save thing" onPress={saveMarkedUpImage}>

            </Button>
            <Button style={styles.clearBtn} title="Clear" onPress={() => {
              setPaths([]);
              console.log(loadedImage)
            }}>
            </Button>
            <Button title="Open Camera" onPress={() => {
              setCameraOpen(true);
            }}></Button> */}
          </>
        }
      </View >

    )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 25,
    paddingLeft: 20,
    // flex: 1,
    flexDirection: "column",
    paddingTop: 10
  },
  tabBar: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    position: "absolute",
    zIndex: 100,
    top: screenHeight * 0.1,
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
    backgroundColor: "#F5EEE5",
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
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
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
  buttonContainer: {
    position: "absolute",
    top: screenHeight * 0.8,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%"
  },
})

