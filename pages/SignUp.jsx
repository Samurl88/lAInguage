import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, ScrollView, Dimensions, TextInput, Pressable, FlatList, SafeAreaView, } from 'react-native';
import auth from '@react-native-firebase/auth';


const screenWidth = Dimensions.get("screen").width
const screenHeight = Dimensions.get("screen").height
const stuff = "";
const errors = {
    "auth/invalid-email": "Please enter a valid email.",
    "auth/email-already-in-use": "This email is already associated with an account.",
    "auth/weak-password": "Your password must include at least 6 characters.",
    "auth/user-not-found": "Your email or password is incorrect.",
    "auth/wrong-password": "Your email or password is incorrect.",
    "auth/invalid-credential": "Your email or password is incorrect."
}


const data = {
    "spanish": "🇪🇸",
    "chinese": "🇨🇳",
    "tagalog": "🇵🇭",
    "vietnamese": "🇻🇳",
    "arabic": "🇸🇦",
    "french": "🇫🇷",
    "korean": "🇰🇷",
    "russian": "🇷🇺",
    "portuguese": "🇵🇹",
    "hindi": "🇮🇳",
    "english": "🇺🇸"
}

export default function SignUpScreen({ navigation, route }) {



    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [signUp, setSignUp] = useState(true)

    async function register() {
        setLoading(true);
        auth()
        .createUserWithEmailAndPassword(email, password)
        .catch(error => {
            setError(errors[error.code] ? errors[error.code] : "Something went wrong!");
            console.log(error)
        })
    }

    async function LoginScreen() {
        setLoading(true);
        auth()
        .signInWithEmailAndPassword(email, password)
        .catch(error => {
            setError(errors[error.code] ? errors[error.code] : "Something went wrong!");
            console.log(error)
        })
    }



    function LanguageIcon({ emoji, language}) {
        return (
            <View style={{color: "rgba(118, 118, 128, 0.12)"}}>
                <Text>{emoji}</Text>
            </View>
        )
    }

    if (signUp)
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F0E7", }}>
            <FlatList 
                data={data}
                renderItem={({item}) => <LanguageIcon language={item.language} />}
            />
            <View style={styles.container}>
                {/* <Pressable onPress={() => { navigation.goBack() }} style={{ position: "absolute", left: 20 }}>
                    <ArrowLeft2 color="#000" size={32} />
                </Pressable> */}
                <Text style={styles.title}>Sign Up</Text>

                <View style={{ position: "absolute", top: screenHeight * 0.15, width: "100%" }}>
                    <View style={{ ...styles.inputContainer, borderColor: error ? "#D41111" : "rgba(60, 60, 67, 0.4)" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: error ? "#D41111" : "rgba(60, 60, 67, 0.4)" }}>
                            <View style={{ alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "white", }}>
                                <Text style={styles.inputLabel}>Email</Text>
                            </View>
                            <TextInput value={email} style={styles.input} placeholder='email@example.com' onChangeText={(text) => setEmail(text)} autoCapitalize='none' />
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={{ alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "white", }}>
                                <Text style={styles.inputLabel}>Password</Text>
                            </View>
                            <TextInput value={password} style={styles.input} placeholder='password' secureTextEntry={true} onChangeText={(text) => setPassword(text)} autoCapitalize='none' />
                        </View>
                    </View>
                    <Text style={styles.error}>{error}</Text>
                </View>

                {email && password
                    ? <Pressable onPress={async () => { register() }}
                        style={styles.infoButton}>
                        <Text style={styles.infoButtonText}>Create Account!</Text>
                    </Pressable>
                    : <Pressable style={styles.infoButton}>
                        <Text style={styles.infoButtonDisabledText}>Create Account!</Text>
                    </Pressable>
                }


            </View>

            <View style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", position: "absolute", top: screenHeight * 0.9, alignSelf: "center" }}>
                <Text style={styles.swapPage}>Already have an account? </Text>
                <Pressable onPress={() => { setSignUp(false) }}><Text style={{ ...styles.swapPage, textDecorationLine: "underline" }}>Log in here!</Text></Pressable>
            </View>
        </SafeAreaView>
    );

    if (!signUp)
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F0E7", }}>
                <View style={styles.container}>
                    {/* <Pressable onPress={() => { navigation.goBack() }} style={{ position: "absolute", left: 20 }}>
                        <ArrowLeft2 color="#000" size={32} />
                    </Pressable> */}
                    <Text style={styles.title}>Login</Text>
    
                    <View style={{ position: "absolute", top: screenHeight * 0.15, width: "100%" }}>
                        <View style={{ ...styles.inputContainer, borderColor: error ? "#D41111" : "rgba(60, 60, 67, 0.4)" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: error ? "#D41111" : "rgba(60, 60, 67, 0.4)" }}>
                                <View style={{ alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "white", }}>
                                    <Text style={styles.inputLabel}>Email</Text>
                                </View>
                                <TextInput value={email} style={styles.input} placeholder='email@example.com' onChangeText={(text) => setEmail(text)} autoCapitalize='none' />
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <View style={{ alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "white", }}>
                                    <Text style={styles.inputLabel}>Password</Text>
                                </View>
                                <TextInput value={password} style={styles.input} placeholder='password' secureTextEntry={true} onChangeText={(text) => setPassword(text)} autoCapitalize='none' />
                            </View>
                        </View>
                        <Text style={styles.error}>{error}</Text>
                    </View>
    
                    {email && password
                        ? <Pressable onPress={async () => { register() }}
                            style={styles.infoButton}>
                            <Text style={styles.infoButtonText}>Sign in!</Text>
                        </Pressable>
                        : <Pressable style={styles.infoButton}>
                            <Text style={styles.infoButtonDisabledText}>Sign in!</Text>
                        </Pressable>
                    }
    
    
                </View>
    
                <View style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", position: "absolute", top: screenHeight * 0.9, alignSelf: "center" }}>
                    <Text style={styles.swapPage}>No account? </Text>
                    <Pressable onPress={() => { setSignUp(true) }}><Text style={{ ...styles.swapPage, textDecorationLine: "underline" }}>Create an account!</Text></Pressable>
                </View>
            </SafeAreaView>
        );
}

const styles = StyleSheet.create({
    container: {
        padding: 50,
        flex: 1,
        alignItems: "center"
    },

    background: {
        padding: 50,
    },
    title: {
        fontSize: 50,
        alignSelf: "center",
        fontFamily: "NewYorkLarge-Regular",
        position: "absolute",
        top: screenHeight * 0.05
    },
    inputContainer: {
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        width: "100%",
    },
    input: {
        fontSize: 15,
        flex: 1,
        backgroundColor: "white",
        height: 50,
        fontFamily: "SFPro-Regular",
    },
    inputLabel: {
        fontFamily: "SFPro-Regular",
        width: screenWidth * 0.23,
        paddingLeft: 15
    },
    infoTitle: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 50,
        position: "absolute",

    },
    infoText: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 22,
        position: "absolute",
        top: screenHeight * 0.45
    },
    infoButton: {
        backgroundColor: "#77BEE9",
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#77BEE9",
        shadowOpacity: 0.5,
        shadowRadius: 10,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        alignSelf: "center",
        zIndex: 100,
        top: screenHeight * 0.31,
        position: "absolute",

    },
    infoButtonText: {
        fontFamily: "SFPro-Regular",
        textAlign: "center",
        fontSize: 20,
    },
    infoButtonDisabledText: {
        fontFamily: "SFPro-Regular",
        textAlign: "center",
        fontSize: 20,
        color: "rgba(0, 0, 0, 0.4)"
    },
    thirdPartyButtonContainer: {
        top: screenHeight * 0.5,
        position: "absolute",
        flexDirection: "column",
        gap: 20,
        alignItems: "center",
        justifyContent: "center",
        width: 300
    },
    iconButton: {
        padding: 10,
        borderRadius: 15,
        borderWidth: 1
    },
    error: {
        color: "#D41111",
        alignSelf: "center",
        marginTop: 10,
        textAlign: "center"
    },
    swapPage: {
        fontFamily: "SF-Pro",
        fontSize: 15
    },
    appleButton: {
        width: "100%",
        height: 50
    }

});








// import { View, Text, SafeAreaView, Pressable, } from 'react-native'
// import React, {useState, useEffect} from 'react'
// import auth from '@react-native-firebase/auth';


// export default function SignUp() {
  
//   const [email, setEmail] = useState("teddyffdvssfrrbu@gmail.com");
//   const [password, setPassword] = useState("password");

//   function signUp(email, password) {
    // auth()
    // // .createUserWithEmailAndPassword(email, password)
//     .signInWithEmailAndPassword(email, password)
//     .then(() => {
//       console.log('User account created & signed in!');
//     })
//     .catch(error => {
//       if (error.code === 'auth/email-already-in-use') {
//         console.log('That email address is already in use!');
//       }
  
//       if (error.code === 'auth/invalid-email') {
//         console.log('That email address is invalid!');
//       }
  
//       console.error(error);
//     });
//   }


//   return (
//     <SafeAreaView>
//       <Text>SignUp</Text>
//       <Pressable onPress={() => signUp(email, password)}>
//         <Text>
//           Sign Up!!!
//         </Text>
//       </Pressable>
//     </SafeAreaView>
//   )
// }