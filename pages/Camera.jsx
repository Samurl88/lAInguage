import { View, Text, SafeAreaView, StyleSheet, Button } from 'react-native'
import { Configuration, PESDK, Tool } from "react-native-photoeditorsdk";
import { useCameraDevice, useCameraPermission, Camera } from 'react-native-vision-camera'
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { useImage, Image } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";
import Config from "react-native-config"
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import { Canvas, Path, useCanvasRef, Picture } from "@shopify/react-native-skia";

import camerabtn from '../assets/camerabtn.png'

import { runOnJS } from 'react-native-reanimated';

// yarn ios--simulator "iPhone 15 Pro"
export default function CameraPage() {
  const genAI = new GoogleGenerativeAI(Config.API_KEY);

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


  const define = async (imageData) => {

    console.log(Config.API_KEY)

    const prompt = `
    Given this image.
    Language: "Mandarin"
    For the highlighted word in the image and the above language, provide its English definition, its translation in the provided language, and its definition in the provided language. Use this JSON schema:
    { "englishDefinition": "string", 
      "translatedWord": "string",
      "translatedDefinition": "string"
    }`

    const result = await model.generateContent([prompt, { inlineData: { data: imageData, mimeType: 'image/png' } }]);
    const response = result.response;
    const text = JSON.parse(response.text());
    console.log(text)
    console.log("response")
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
      <SafeAreaView style={styles.backgroundContainer}>
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
              {/* <Image source={camerabtn} style={{ height: 100, width: 100 }} /> */}
            </View>
          </>
          :
          <GestureHandlerRootView style={{ flex: 1 }}>
            <GestureDetector gesture={pan}>
              <View style={styles.drawingContainer}>
                {/* <Image source={{
                  uri: image,
                }} style={styles.image} /> */}

                <Canvas style={styles.canvas} ref={canvasRef}>
                  {/* {testImg ? */}
                  <Image image={loadedImage} fit="cover" width={300} height={500} style={styles.img} />
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
            <Text
              style={{ color: "white", fontSize: 24 }}
            >{`Gesture started at:  ${tGestureStart}`}</Text>
            <Text
              style={{ color: "white", fontSize: 24 }}
            >{`Gesture moved to:  ${tGestureMove}`}</Text>
            <Text
              style={{ color: "white", fontSize: 24 }}
            >{`Gesture updated to:  ${tGestureUpdate}`}</Text>
            <Text
              style={{ color: "white", fontSize: 24 }}
            >{`Gesture ended at:  ${tGestureEnd}`}</Text>
          </GestureHandlerRootView>
        }
        <Button title="save thing" onPress={saveMarkedUpImage}>

        </Button>
        <Button style={styles.clearBtn} title="Clear" onPress={() => {
          setPaths([]);
          console.log(loadedImage)
        }}>
        </Button>
        <Button title="sup" onPress={async () => {
          setCameraOpen(true)
          const photo = await camera.current.takePhoto();
          console.log(photo.path)
          setCameraOpen(false)
          setImage(photo.path)
          // highlightPhoto(photo.path)
        }}></Button>
      </SafeAreaView >

    )
}

const styles = StyleSheet.create({
  clearBtn: {

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
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
  },
})

