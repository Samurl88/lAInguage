import { View, Text, SafeAreaView, Dimensions, StyleSheet, Switch, Pressable } from 'react-native'
import React, { useState } from 'react'
import { TextInput } from 'react-native-gesture-handler';
import { SFSymbol } from 'react-native-sfsymbols';

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

export default function Settings({ language, termsPerSession, notifications, close }) {
    // Hooks for switch
    const [isEnabled, setIsEnabled] = useState(notifications);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    // Hooks for local changes to settings
    const [currentTPS, setCurrentTPS] = useState(termsPerSession);
    const [currentNotifications] = useState(notifications);

    function handleClose() {
        close()

    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F5EEE5", alignItems: "center", }}>
            <View style={{ width: "85%", alignItems: "flex-end" }}>
                <Pressable onPress={handleClose}>
                    <Text style={{ fontSize: 20, }}>Done</Text>
                </Pressable>

            </View>
            <View style={styles.container}>
                <Text style={styles.title}>Settings</Text>
                <View style={{ width: "85%", gap: 20 }}>
                    <View style={{ gap: 5 }}>
                        <Text>Study Options</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={styles.option}>Terms Per Session</Text>
                            <View style={{ gap: 15, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                <Pressable style={{ justifyContent: "center", alignItems: "center" }} onPress={() => {
                                    
                                }}>
                                    <SFSymbol name="arrowtriangle.left.circle.fill" size={20} width={20} height={20} color="#77bee9" />
                                </Pressable>
                                <Text style={styles.option}>{termsPerSession}</Text>
                                <Pressable style={{ justifyContent: "center", alignItems: "center" }}>
                                    <SFSymbol name="arrowtriangle.right.circle.fill" size={20} width={20} height={20} color="#77bee9" />
                                </Pressable>

                            </View>
                        </View>
                    </View>
                    <View style={{ gap: 5 }}>
                        <Text>Misc.</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={styles.option}>Daily Reminders</Text>
                            <Switch
                                trackColor={{ false: '#767577', true: '#77bee9' }}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleSwitch}
                                value={isEnabled}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: screenHeight * 0.1,
        alignItems: "center",
        flex: 1,
        height: screenHeight,
        width: screenWidth
    },
    title: {
        fontFamily: "NewYorkLarge-Semibold",
        fontSize: 30,
        paddingBottom: 40
    },
    option: {
        fontFamily: "SFPro-Medium",
        fontSize: 20,
    },
});