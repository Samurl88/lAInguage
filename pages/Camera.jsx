import { View, Text, SafeAreaView, StyleSheet, Button, Image } from 'react-native'
import { Configuration, PESDK, Tool } from "react-native-photoeditorsdk";
import { useCameraDevice, useCameraPermission, Camera } from 'react-native-vision-camera'
import React, { useEffect, useRef, useState } from 'react'

export default function CameraPage() {
  const configuration: Configuration = {
    // For this example only the sticker, text, and brush tool are enabled.
    tools: [Tool.STICKER, Tool.TEXT, Tool.BRUSH],

    // For this example only stickers suitable for annotations are enabled.
    sticker: {
      categories: [
        {
          identifier: "annotation_stickers",
          name: "Annotation",

        },
      ],
    },
  };

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
          <Image source={{
            uri: image,
          }} style={styles.image} />
        }

        <Button title="sup" onPress={async () => {
          setCameraOpen(true)
          const photo = await camera.current.takePhoto();
          console.log(photo.path)
          setCameraOpen(false)
          setImage(photo.path)
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

