import { View, Text, SafeAreaView, StyleSheet, Button, Dimensions, Pressable } from 'react-native'
import { Configuration, PESDK, Tool } from "react-native-photoeditorsdk";
import { useCameraDevice, useCameraPermission, Camera } from 'react-native-vision-camera'
import React, { useEffect, useRef, useState } from 'react'
import { useImage, Image } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";
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
  const [paths, setPaths] = useState([]);
  const canvasRef = useCanvasRef();


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
    console.log(bytes)

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
        <View style={styles.tabBar}>
          <SFSymbol name="camera.fill" size={18} color="#2F2C2A"/>
          <SFSymbol name="doc.on.doc.fill" size={18} color="#2F2C2A" style={{opacity: 0.21}}/>
          <SFSymbol name="character.book.closed.fill" size={18} color="#2F2C2A" style={{opacity: 0.21}}/>
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
                  <Image image={loadedImage} fit="cover" x={0} y={0} width={300} height={500} />
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
          <Button title="save thing" onPress={saveMarkedUpImage}>

          </Button>
          <Button style={styles.clearBtn} title="Clear" onPress={() => {
            setPaths([]);
            console.log(loadedImage)
          }}>
          </Button>
          </>
        }
      </SafeAreaView >

    )
}

const styles = StyleSheet.create({
  clearBtn: {

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

