import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import {
  useCameraDevice, useCameraPermission, Camera, PermissionsPage, NoCameraDeviceError
} from 'react-native-vision-camera';

export default function HomePage() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back')
  if (!hasPermission) return <PermissionsPage />
  if (device == null) return <NoCameraDeviceError />
  return (
    <View>
      <Text>HomePage hi</Text>
      <View style={styles.container}>

        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
        />
      </View>
    </View>
  )
}
const styles = StyleSheet.create({

})
//yarn ios --simulator "iPhone 15 Pro"