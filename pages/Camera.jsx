import { View, Text, SafeAreaView, StyleSheet, Button, Image } from 'react-native'
import { Configuration, PESDK, Tool } from "react-native-photoeditorsdk";
import { useCameraDevice, useCameraPermission, Camera } from 'react-native-vision-camera'
import React, { useEffect, useRef, useState } from 'react'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

export default function CameraPage() {
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
      // Start gesture looks like this 
      // {
      //   "absoluteX": 178,
      //   "absoluteY": 484,
      //   "handlerTag": 2,
      //   "numberOfPointers": 1,
      //   "oldState": 2,
      //   "state": 4,
      //   "target": 115,
      //   "translationX": -4.3333282470703125,
      //   "translationY": 0,
      //   "velocityX": -172.0102558333448,
      //   "velocityY": 0,
      //   "x": 178,
      //   "y": 484,
      // }
      setTGestureStart(`${Math.round(g.x)}, ${Math.round(g.y)}`);
    })
    .onTouchesMove((g) => {
      // Move gesture looks like this
      // {
      //   "allTouches": Array [
      //     {
      //       "absoluteX": 123.33332824707031,
      //       "absoluteY": 449,
      //       "id": 0,
      //       "x": 123.33332824707031,
      //       "y": 449,
      //     },
      //   ],
      //   "changedTouches": Array [
      //    {
      //       "absoluteX": 123.33332824707031,
      //       "absoluteY": 449,
      //       "id": 0,
      //       "x": 123.33332824707031,
      //       "y": 449,
      //     },
      //   ],
      //   "eventType": 2,
      //   "handlerTag": 2,
      //   "numberOfTouches": 1,
      //   "state": 4,
      //   "target": 115,
      // }
      setTGestureMove(
        `${Math.round(g.changedTouches[0].x)}, ${Math.round(
          g.changedTouches[0].y
        )}`
      );
    })
    .onUpdate((g) => {
      // Update gesture looks like
      // {
      //   "absoluteX": 229,
      //   "absoluteY": 400.3333282470703,
      //   "handlerTag": 2,
      //   "numberOfPointers": 1,
      //   "state": 4,
      //   "target": 115,
      //   "translationX": 0,
      //   "translationY": 1.6666717529296875,
      //   "velocityX": 0,
      //   "velocityY": 24.111687246989227,
      //   "x": 229,
      //   "y": 400.3333282470703,
      // }
      setTGestureUpdate(`${Math.round(g.x)}, ${Math.round(g.y)}`);
    })
    .onEnd((g) => {
      // End gesture looks like this
      // {
      //   "absoluteX": 213.3333282470703,
      //   "absoluteY": 542.6666564941406,
      //   "handlerTag": 2,
      //   "numberOfPointers": 0,
      //   "oldState": 4,
      //   "state": 5,
      //   "target": 115,
      //   "translationX": -66,
      //   "translationY": 172,
      //   "velocityX": -71.28075141720757,
      //   "velocityY": 567.0058445795321,
      //   "x": 213.3333282470703,
      //   "y": 542.6666564941406,
      // }
      setTGestureEnd(`${Math.round(g.x)}, ${Math.round(g.y)}`);
    });
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
              <Image source={{
                uri: image,
              }} style={styles.image} />

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

        <Button title="sup" onPress={async () => {
          setCameraOpen(true)
          const photo = await camera.current.takePhoto();
          console.log(photo.path)
          setCameraOpen(false)
          setImage(photo.path)
          // highlightPhoto(photo.path)
        }}></Button>
      </SafeAreaView>

    )
}

const styles = StyleSheet.create({
  backgroundContainer: {
    backgroundColor: "green",
    flex: 1,
    height: "100%"
  },
  image: {
    flex: 1, // Add this style to make the image fill its container
    resizeMode: 'contain', // Ensure the image maintains its aspect ratio
  },
})

