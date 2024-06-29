import { View, Text, SafeAreaView, StyleSheet, Button, Image } from 'react-native'
import { Configuration, PESDK, Tool } from "react-native-photoeditorsdk";
import { useCameraDevice, useCameraPermission, Camera } from 'react-native-vision-camera'
import React, { useEffect, useRef, useState } from 'react'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Canvas, Path } from "@shopify/react-native-skia";



// interface IPath {
//   segments: String[];
//   color?: string;
// }

export default function CameraPage() {
  const [paths, setPaths] = useState([]);
  // const [photo, setPhot]
  // const configuration: Configuration = {
  //   // For this example only the sticker, text, and brush tool are enabled.
  //   tools: [Tool.STICKER, Tool.TEXT, Tool.BRUSH],

  //   // For this example only stickers suitable for annotations are enabled.
  //   sticker: {
  //     categories: [
  //       {
  //         identifier: "annotation_stickers",
  //         name: "Annotation",

  //       },
  //     ],
  //   },
  // };

  const camera = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(true);
  const [image, setImage] = useState(null);
  // const processImageForOCR = async (imageUri) => {
  //   try {
  //     const processedImage = await FirebaseMLVision.cloudDocumentTextRecognizerProcessImage(
  //       imageUri
  //     );
  //     const recognizedText = processedImage.text;
  //     console.log(recognizedText)
  //     return recognizedText;
  //   } catch (error) {
  //     console.error('Error processing image for OCR:', error);
  //   }
  // };
  const device = useCameraDevice('back')
  const { hasPermission, requestPermission } = useCameraPermission()


  // async function highlightPhoto(photo) {
  //   try {
  //     // Open the photo editor and handle the export as well as any occuring errors.
  //     const result = await PESDK.openEditor(photo, configuration);

  //     // highlight-events
  //     if (result != null) {
  //       // The user exported a new photo successfully and the newly generated photo is located at `result.image`.
  //       console.log(result.image);
  //     } else {
  //       // The user tapped on the cancel button within the editor.
  //       return;
  //     }
  //   } catch (error) {
  //     // There was an error generating the photo.
  //     console.log(error);
  //   }
  // }
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
      setPaths(newPaths);
      setTGestureStart(`${Math.round(g.x)}, ${Math.round(g.y)}`);
    })
    .onUpdate((g) => {
      const index = paths.length - 1;
      const newPaths = [...paths];
      if (newPaths?.[index]?.segments) {
        newPaths[index].segments.push(`L ${g.x} ${g.y}`);
        setPaths(newPaths);
      }
    }).minDistance(1)
  useEffect(() => {
    if (!hasPermission)
      requestPermission()

  }, [])


  if (hasPermission)
    return (
      <SafeAreaView style={styles.backgroundContainer}>
        {cameraOpen ? <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
        /> :
          <GestureHandlerRootView style={{ flex: 1 }}>
            <GestureDetector gesture={pan}>
              <View style={styles.drawingContainer}>
                <Image source={{
                  uri: image,
                }} style={styles.image} />

                <Canvas style={styles.canvas}>
                  {paths.map((p, index) => (
                    <Path
                      key={index}
                      path={p.segments.join(" ")}
                      strokeWidth={30}
                      style="stroke"
                      color={p.color}

                    />
                  ))}
                </Canvas>

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
        <Button style={styles.clearBtn} title="Clear" onPress={() => {
          setPaths([]);
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
    opacity: 0.5
  },
})

