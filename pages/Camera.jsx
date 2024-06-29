import { View, Text, SafeAreaView, StyleSheet} from 'react-native'

import { useCameraDevice, useCameraPermission, Camera } from 'react-native-vision-camera'
import React, { useEffect } from 'react'

export default function CameraPage() {
  const device = useCameraDevice('back')
  const { hasPermission, requestPermission } = useCameraPermission()

  useEffect(() => {
    if (!hasPermission)
    requestPermission()

  }, [])
  
  
  if (hasPermission)
  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
    />
  )
}

