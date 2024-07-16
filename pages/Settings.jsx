import { View, Text, SafeAreaView, Dimensions, StyleSheet, Switch, Pressable, FlatList, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { TextInput } from 'react-native-gesture-handler';
import { SFSymbol } from 'react-native-sfsymbols';
import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";
import notifee from '@notifee/react-native';
import { appleAuth } from '@invertase/react-native-apple-authentication';


const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

const speedToName = ["0.5x", "1x", "2x"]

const data = [
    { "language": "english", "emoji": "🇺🇸" },
    { "language": "spanish", "emoji": "🇪🇸" },
    { "language": "chinese", "emoji": "🇨🇳" },
    { "language": "tagalog", "emoji": "🇵🇭" },
    { "language": "vietnamese", "emoji": "🇻🇳" },
    { "language": "arabic", "emoji": "🇸🇦" },
    { "language": "french", "emoji": "🇫🇷" },
    { "language": "korean", "emoji": "🇰🇷" },
    { "language": "russian", "emoji": "🇷🇺" },
    { "language": "portuguese", "emoji": "🇵🇹" },
    { "language": "hindi", "emoji": "🇮🇳" },
]

export default function Settings({ language, translations, termsPerSession, notifications, close, scheduleRepeatingReminder, wordSpeed }) {
    // Hooks for switch
    const [currentNotifications, setCurrentNotifications] = useState(notifications !== undefined ? notifications : true);
    const toggleSwitch = () => setCurrentNotifications(previousState => !previousState);

    const [currentTPS, setCurrentTPS] = useState(termsPerSession !== undefined ? termsPerSession : 10);

    const [currentWordSpeed, setCurrentWordSpeed] = useState(wordSpeed !== undefined ? wordSpeed : 1)

    const [chosenLanguage, setChosenLanguage] = useState(language)


    function handleClose() {
        console.log(currentNotifications)
        console.log(currentTPS)
        let uid = auth().currentUser.uid
        if (currentTPS)
            database()
                .ref(`${uid}/profile`)
                .update({
                    notifications: currentNotifications,
                    termsPerSession: currentTPS,
                    wordSpeed: currentWordSpeed,
                    language: chosenLanguage
                })


        if (currentNotifications === false) {
            notifee.cancelAllNotifications()
        } else {
            scheduleRepeatingReminder(new Date)
        }

        close()

    }

    // Add later when deleting account
    async function deleteAppleAccount() {
        // Get an authorizationCode from Apple
        const { authorizationCode } = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.REFRESH,
        });
        
        // Ensure Apple returned an authorizationCode
        if (!authorizationCode) {
            throw new Error('Apple Revocation failed - no authorizationCode returned');
        }

        // Revoke the token
        auth().revokeToken(authorizationCode)

        // Delete data
        let uid = auth().currentUser.uid
        database()
            .ref(`/${uid}`)
            .set(null)

        // Delete account
        auth().currentUser
            .delete()
            .then(() => console.log("user deleted!"))
            .catch(e => console.log(e))

        return;
    }

    async function deleteAccount() {
        const provider = auth().currentUser?.providerData[0]?.providerId;
        console.log(provider)

        // Apple specific - revoke token
        if (provider == "apple.com") {
            await deleteAppleAccount();
        } else {
            // Delete user data
            let uid = auth().currentUser.uid

            // Delete data
            database()
                .ref(`/${uid}`)
                .set(null)

            // Delete account
            auth().currentUser
                .delete()
                .then(() => console.log("user deleted!"))
                .catch(e => console.log(e))

        }
    }


    function LanguageIcon({ emoji, language }) {
        return (
            <Pressable onPress={() => setChosenLanguage(language)} style={{ backgroundColor: "rgba(118, 118, 128, 0.12)", height: 60, width: 60, justifyContent: "center", alignItems: "center", borderRadius: 30, borderWidth: chosenLanguage === language ? 2 : 0 }}>
                <Text style={{ fontSize: 40, }}>{emoji}</Text>
            </Pressable>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F5EEE5", alignItems: "center", }}>
            <View style={{ width: "85%", alignItems: "flex-end", position: "absolute", top: screenHeight * 0.06 }}>
                <Pressable onPress={handleClose}>
                    <Text style={{ fontSize: 20, }}>{translations.done[chosenLanguage]}</Text>
                </Pressable>

            </View>
            <View style={styles.container}>
                <Text style={styles.title}>{translations.settings[chosenLanguage]}</Text>
                <View style={{ width: "85%", gap: 20 }}>
                    <View style={{ gap: 5 }}>
                        <Text>{translations.study_options[chosenLanguage]}</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={styles.option}>{translations.terms_per_session[chosenLanguage]}</Text>
                            <View style={{ gap: 5, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                <Pressable style={{ justifyContent: "center", alignItems: "center", opacity: currentTPS <= 5 ? 0.4 : 1, }} onPress={() => {
                                    if (currentTPS > 5)
                                        setCurrentTPS(currentTPS - 1)
                                }}>
                                    {({ pressed }) => (
                                        <SFSymbol name="arrowtriangle.left.circle.fill" size={25} width={30} height={30} color={pressed && currentTPS > 5 ? "#67A4C9" : "#77bee9"} />
                                    )}
                                </Pressable>
                                <Text style={{ ...styles.option, width: 50, textAlign: "center" }}>{currentTPS}</Text>
                                <Pressable style={{ justifyContent: "center", alignItems: "center", opacity: currentTPS >= 15 ? 0.4 : 1 }} onPress={() => {
                                    if (currentTPS < 15)
                                        setCurrentTPS(currentTPS + 1)
                                }}>
                                    {({ pressed }) => (
                                        <SFSymbol name="arrowtriangle.right.circle.fill" size={25} width={30} height={30} color={pressed && currentTPS < 15 ? "#67A4C9" : "#77bee9"} />
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    </View>
                    <View style={{ gap: 5 }}>
                        <Text>{translations.dictionary_options[chosenLanguage]}</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={styles.option}>Enunciation Speed</Text>
                            <View style={{ gap: 5, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                <Pressable style={{ justifyContent: "center", alignItems: "center", opacity: currentWordSpeed <= 0 ? 0.4 : 1 }} onPress={() => {
                                    if (currentWordSpeed > 0)
                                        setCurrentWordSpeed(currentWordSpeed - 1)
                                }}>
                                    {({ pressed }) => (
                                        <SFSymbol name="arrowtriangle.left.circle.fill" size={25} width={30} height={30} color={pressed && currentWordSpeed > 0 ? "#67A4C9" : "#77bee9"} />
                                    )}
                                </Pressable>
                                <Text style={{ ...styles.option, width: 50, textAlign: "center" }}>{speedToName[currentWordSpeed]}</Text>
                                <Pressable style={{ justifyContent: "center", alignItems: "center", opacity: currentWordSpeed >= 2 ? 0.4 : 1 }} onPress={() => {
                                    if (currentWordSpeed < 2)
                                        setCurrentWordSpeed(currentWordSpeed + 1)
                                }}>
                                    {({ pressed }) => (
                                        <SFSymbol name="arrowtriangle.right.circle.fill" size={25} width={30} height={30} color={pressed && currentWordSpeed < 2 ? "#67A4C9" : "#77bee9"} />
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    </View>
                    <View style={{ gap: 5 }}>
                        <Text>{translations.misc[chosenLanguage]}</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={styles.option}>{translations.daily_reminders[chosenLanguage]}</Text>
                            <Switch
                                trackColor={{ false: '#767577', true: '#77bee9' }}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleSwitch}
                                value={currentNotifications}
                            />
                        </View>
                    </View>
                </View>
                <View style={{ width: "85%", paddingTop: 20 }}>
                    <Text>{translations.language[chosenLanguage]}</Text>
                </View>
                <FlatList
                    data={data}
                    renderItem={({ item }) => <LanguageIcon language={item.language} emoji={item.emoji} />}
                    horizontal
                    contentContainerStyle={styles.languageList}
                    showsHorizontalScrollIndicator={false}
                />



                <Pressable style={styles.logOutBtn} onPress={() => {
                    Alert.alert('Are you sure?', 'This will irreversibly delete all your terms and preferences.', [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                        {
                            text: 'Delete',
                            onPress: () => deleteAccount(),
                            style: 'destructive',
                        },
                    ]);
                }}>
                    <Text style={styles.logOutText}>
                        Delete Account
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
        borderColor: "black",
        borderWidth: 1,
        width: "85%",
        borderRadius: 10,
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: screenHeight * 0.78
    },
    logOutText: {
        color: "black",
        fontSize: 18,
        fontFamily: "SFPro-Regular"
    },
    languageList: {
        gap: 15,
        paddingLeft: 30,
        paddingRight: 30,
        paddingTop: 10
    },
});