import { View, Text, SafeAreaView, StyleSheet, Button } from 'react-native'
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

import camerabtn from '../assets/camerabtn.png'

import { runOnJS } from 'react-native-reanimated';

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

