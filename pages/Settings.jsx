import { View, Text, SafeAreaView, Dimensions, StyleSheet, Switch, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { TextInput } from 'react-native-gesture-handler';
import { SFSymbol } from 'react-native-sfsymbols';
import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

export default function Settings({ language, termsPerSession, notifications, close, logout }) {
    // Hooks for switch
    const [currentNotifications, setCurrentNotifications] = useState(notifications !== undefined ? notifications : true);
    const toggleSwitch = () => setCurrentNotifications(previousState => !previousState);
    
    const [currentTPS, setCurrentTPS] = useState(termsPerSession !== undefined ? termsPerSession : 10);

    function handleClose() {
        console.log(currentNotifications)
        console.log(currentTPS)
        let uid = auth().currentUser.uid
        if (currentTPS)
            database()
                .ref(`${uid}/profile`)
                .update({
                    notifications: currentNotifications,
                    termsPerSession: currentTPS
                })     
        
        
                
        close()

    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F5EEE5", alignItems: "center", }}>
            <View style={{ width: "85%", alignItems: "flex-end", top: 10 }}>
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
                            <View style={{ gap: 5, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                <Pressable style={{ justifyContent: "center", alignItems: "center", opacity: currentTPS <= 5 ? 0.4 : 1 }} onPress={() => {
                                    if (currentTPS > 5) 
                                        setCurrentTPS(currentTPS - 1)
                                }}>
                                    <SFSymbol name="arrowtriangle.left.circle.fill" size={25} width={30} height={30} color="#77bee9" />
                                </Pressable>
                                <Text style={{...styles.option, width: 25, textAlign: "center"}}>{currentTPS}</Text>
                                <Pressable style={{ justifyContent: "center", alignItems: "center", opacity: currentTPS >= 15 ? 0.4 : 1 }} onPress={() => {
                                    if (currentTPS < 15) 
                                        setCurrentTPS(currentTPS + 1)
                                }}>
                                    <SFSymbol name="arrowtriangle.right.circle.fill" size={25} width={30} height={30} color="#77bee9" />
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
                                value={currentNotifications}
                            />
                        </View>
                    </View>
                </View>
                <Pressable style={styles.logOutBtn} onPress={() => {
                    logout();
                }}>
                    <Text style={styles.logOutText}>
                        Log Out
                    </Text>
                </Pressable>
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
    logOutBtn: {
        backgroundColor: "black",
        width: "85%",
        borderRadius: 10, 
        padding: 15,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute", 
        top: screenHeight * 0.75
    },
    logOutText: {
        color: "#F5EEE5",
        fontSize: 20
    }
});