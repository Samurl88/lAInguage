import { View, Text, SafeAreaView, Image, Dimensions, FlatList, Pressable, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import lexify from '../assets/lexify.png'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Defs, LinearGradient, Path, Stop, Svg } from 'react-native-svg';
import { SFSymbol } from 'react-native-sfsymbols';

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;


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

const translations =
{
    "next": {
        "spanish": "Siguiente",
        "chinese": "下一个",
        "tagalog": "Susunod",
        "vietnamese": "Tiếp Theo",
        "arabic": "التالي",
        "french": "Suivant",
        "korean": "다음",
        "russian": "Следующий",
        "portuguese": "Próximo",
        "hindi": "अगला",
        "english": "Next"
    }
}


export default function Onboarding() {
    const [chosenLanguage, setChosenLanguage] = useState("english")
    const [page, setPage] = useState(0)

    const duration = 500
    const delay = 250

    function LanguageIcon({ emoji, language }) {
        return (
            <Pressable onPress={() => setChosenLanguage(language)} style={{ backgroundColor: "rgba(118, 118, 128, 0.12)", height: 60, width: 60, justifyContent: "center", alignItems: "center", borderRadius: 30, borderWidth: chosenLanguage === language ? 2 : 0 }}>
                <Text style={{ fontSize: 40, }}>{emoji}</Text>
            </Pressable>
        )
    }

    if (page == -1)
        return (
            <View style={{ backgroundColor: "#F5EEE5", alignItems: "center", flex: 1 }}>
                <Animated.Image key="image" entering={FadeIn.duration(duration).delay(delay)} exiting={FadeOut.duration(duration).delay(delay)} source={lexify} style={{ top: screenHeight * 0.15, position: "absolute", height: screenHeight * 0.3, width: screenHeight * 0.3, }} />
                <Animated.View entering={FadeIn.duration(duration).delay(delay * 2)} exiting={FadeOut.duration(duration).delay(delay * 2)} style={{ width: "100%" }}>
                    <FlatList
                        data={data}
                        renderItem={({ item }) => <LanguageIcon language={item.language} emoji={item.emoji} />}
                        horizontal
                        contentContainerStyle={{ gap: 15, paddingLeft: 30, paddingRight: 30, paddingTop: 20, }}
                        showsHorizontalScrollIndicator={false}
                        style={{ position: "absolute", top: screenHeight * 0.47, }}
                    />
                </Animated.View>
                <Animated.View entering={FadeIn.duration(duration).delay(delay * 3)} exiting={FadeOut.duration(duration).delay(delay * 3)}>
                    <Pressable style={styles.button} onPress={() => setPage(page + 1)}>
                        <Text style={styles.buttonText}>{translations.next[chosenLanguage]}</Text>
                    </Pressable>
                </Animated.View>
            </View>
        )

    if (page == 0)
        return (
            <View style={{ backgroundColor: "#F5EEE5", alignItems: "center", flex: 1 }}>
                <Animated.View style={{position: "absolute", top: screenHeight * 0.1, gap: 25, alignItems: "center"}}>
                    <Svg
                        width={screenWidth * 0.5}
                        height={screenWidth * 0.5}
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <Path
                            d="M8.5 17a.694.694 0 01-.485-.188.81.81 0 01-.247-.477 33.306 33.306 0 00-.435-2.447c-.147-.688-.33-1.27-.545-1.748a3.85 3.85 0 00-.792-1.202 3.677 3.677 0 00-1.192-.793c-.477-.204-1.054-.375-1.73-.511a33.305 33.305 0 00-2.384-.4.793.793 0 01-.503-.24A.706.706 0 010 8.5a.69.69 0 01.196-.494.824.824 0 01.494-.248c1.107-.12 2.038-.261 2.793-.426.756-.17 1.377-.404 1.866-.7A3.45 3.45 0 006.54 5.449c.301-.5.542-1.14.724-1.918.182-.78.35-1.737.503-2.874A.81.81 0 018.015.18.713.713 0 018.5 0a.67.67 0 01.468.179c.137.12.222.279.256.477.159 1.137.33 2.095.511 2.874.187.773.431 1.41.732 1.91.301.494.696.889 1.184 1.184.489.296 1.11.529 1.866.7.755.164 1.686.31 2.793.434.193.029.355.111.486.248A.674.674 0 0117 8.5a.674.674 0 01-.204.494.785.785 0 01-.494.24 26.945 26.945 0 00-2.794.443c-.755.164-1.38.395-1.874.69a3.451 3.451 0 00-1.184 1.194c-.295.494-.536 1.13-.724 1.91a30.81 30.81 0 00-.502 2.864.752.752 0 01-.247.477A.664.664 0 018.5 17z"
                            fill="url(#paint0_linear_49_1672)"
                        />
                        <Path
                            d="M8.5 17a.694.694 0 01-.485-.188.81.81 0 01-.247-.477 33.306 33.306 0 00-.435-2.447c-.147-.688-.33-1.27-.545-1.748a3.85 3.85 0 00-.792-1.202 3.677 3.677 0 00-1.192-.793c-.477-.204-1.054-.375-1.73-.511a33.305 33.305 0 00-2.384-.4.793.793 0 01-.503-.24A.706.706 0 010 8.5a.69.69 0 01.196-.494.824.824 0 01.494-.248c1.107-.12 2.038-.261 2.793-.426.756-.17 1.377-.404 1.866-.7A3.45 3.45 0 006.54 5.449c.301-.5.542-1.14.724-1.918.182-.78.35-1.737.503-2.874A.81.81 0 018.015.18.713.713 0 018.5 0a.67.67 0 01.468.179c.137.12.222.279.256.477.159 1.137.33 2.095.511 2.874.187.773.431 1.41.732 1.91.301.494.696.889 1.184 1.184.489.296 1.11.529 1.866.7.755.164 1.686.31 2.793.434.193.029.355.111.486.248A.674.674 0 0117 8.5a.674.674 0 01-.204.494.785.785 0 01-.494.24 26.945 26.945 0 00-2.794.443c-.755.164-1.38.395-1.874.69a3.451 3.451 0 00-1.184 1.194c-.295.494-.536 1.13-.724 1.91a30.81 30.81 0 00-.502 2.864.752.752 0 01-.247.477A.664.664 0 018.5 17z"
                        />
                        <Defs>
                            <LinearGradient
                                id="paint0_linear_49_1672"
                                x1={2}
                                y1={2.5}
                                x2={15}
                                y2={16}
                                gradientUnits="userSpaceOnUse"
                            >
                                <Stop stopColor="#65BAEE" />
                                <Stop offset={1} stopColor="#FD8DFF" />
                            </LinearGradient>
                        </Defs>
                    </Svg>
                    <Animated.View>
                        <Text style={{ letterSpacing: 3, lineHeight: 30, fontSize: 20, fontFamily: "NewYorkLarge-Regular", alignSelf: "center", textAlign: "center",}}>Built for {"\n"} immersion.</Text>
                    </Animated.View>
                </Animated.View>
                <View style={{position: "absolute", top: screenHeight * 0.5, gap: 25, }}>
                    <Animated.View style={{ flexDirection: "row", gap: 25 }}>
                        <SFSymbol name="checkmark" size={28} color="black" />
                        <Text style={styles.listText}>C</Text>
                    </Animated.View>
                    <Animated.View style={{ flexDirection: "row", gap: 25 }}>
                        <SFSymbol name="checkmark" size={28} color="black" />
                        <Text style={styles.listText}>What's the world of the dog?</Text>
                    </Animated.View>
                    <Animated.View style={{ flexDirection: "row", gap: 25 }}>
                        <SFSymbol name="checkmark" size={28} color="black" />
                        <Text style={styles.listText}>What's the world of the dog?</Text>
                    </Animated.View>
                </View>
                <Animated.View entering={FadeIn.duration(duration).delay(delay * 3)} exiting={FadeOut.duration(duration).delay(delay * 3)}>
                    <Pressable style={styles.button} onPress={() => setPage(page + 1)}>
                        <Text style={styles.buttonText}>{translations.next[chosenLanguage]}</Text>
                    </Pressable>
                </Animated.View>

            </View>
        )
}

const styles = StyleSheet.create({
    listText: {
        fontSize: 20, 
        // fontFamily: "NewYorkLarge-Regular", 
        alignSelf: "center", 
        textAlign: "center",

    },
    button: {
        backgroundColor: "#77BEE9",
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#77BEE9",
        shadowOpacity: 0.7,
        shadowRadius: 10,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        alignSelf: "center",
        zIndex: 100,
        top: screenHeight * 0.75,
        position: "absolute",

    },
    buttonText: {
        fontFamily: "SFPro-Regular",
        textAlign: "center",
        fontSize: 20,
    },
})