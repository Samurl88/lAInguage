import { View, Text, SafeAreaView, Image, Dimensions, FlatList, Pressable, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import lexify from '../assets/lexify.png'
import Animated, { FadeIn, FadeOut, runOnJS, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
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
    },
    "built_for_immersion": {
        "spanish": "Construido para \n inmersión.",
        "chinese": "专为 \n 沉浸式体验而设计。",
        "tagalog": "Nilikha para sa \n paglubog.",
        "vietnamese": "Được xây dựng để \n đắm chìm.",
        "arabic": "مصمم ل \n الانغماس.",
        "french": "Conçu pour \n immersion.",
        "korean": "몰입을 위해 \n 설계되었습니다.",
        "russian": "Создано для \n погружения.",
        "portuguese": "Construído para \n imersão.",
        "hindi": "डिज़ाइन किया गया \n अनुभव के लिए।",
        "english": "Built for \n immersion."
    },
    "convenient_translations_of_words_you_dont_know": {
        "spanish": "Traducciones convenientes de palabras que no conoces",
        "chinese": "不认识的单词的便捷翻译",
        "tagalog": "Maginhawang pagsasalin ng mga salitang hindi mo alam",
        "vietnamese": "Bản dịch tiện lợi của những từ bạn không biết",
        "arabic": "ترجمات مريحة للكلمات التي لا تعرفها",
        "french": "Traductions pratiques des mots que vous ne connaissez pas",
        "korean": "모르는 단어의 편리한 번역",
        "russian": "Удобные переводы слов, которые вы не знаете",
        "portuguese": "Traduções convenientes de palavras que você não conhece",
        "hindi": "आपके न जानने वाले शब्दों के सुविधाजनक अनुवाद",
        "english": "Convenient translations of words you don't know"
    },
    "extensive_vocabulary_practice_with_ai_powered_training": {
        "spanish": "Práctica extensa de vocabulario con entrenamiento impulsado por IA",
        "chinese": "通过 AI 驱动的训练进行广泛的词汇练习",
        "tagalog": "Malawak na pagsasanay sa bokabularyo gamit ang AI-powered na pagsasanay",
        "vietnamese": "Luyện tập từ vựng phong phú với đào tạo hỗ trợ bởi AI",
        "arabic": "ممارسة واسعة النطاق للمفردات مع تدريب مدعوم بالذكاء الاصطناعي",
        "french": "Pratique étendue du vocabulaire avec un entraînement assisté par l'IA",
        "korean": "AI 기반 교육으로 폭넓은 어휘 연습",
        "russian": "Обширная практика словарного запаса с обучением на основе ИИ",
        "portuguese": "Prática extensiva de vocabulário com treinamento impulsionado por IA",
        "hindi": "एआई-संचालित प्रशिक्षण के साथ व्यापक शब्दावली अभ्यास",
        "english": "Extensive vocabulary practice with AI-powered training"
    }, "intuitive_catalogues_of_words_youve_scanned_for_mastery": {
        "spanish": "Catálogos intuitivos de palabras que has escaneado para el dominio",
        "chinese": "直观的词汇目录，便于掌握",
        "tagalog": "Intuitive na mga katalogo ng mga salitang na-scan mo para sa mastery",
        "vietnamese": "Danh mục trực quan của các từ bạn đã quét để thành thạo",
        "arabic": "كتالوجات بديهية للكلمات التي قمت بمسحها ضوئيًا لإتقانها",
        "french": "Catalogues intuitifs des mots que vous avez scannés pour la maîtrise",
        "korean": "숙달을 위해 스캔한 단어의 직관적인 카탈로그",
        "russian": "Интуитивно понятные каталоги слов, которые вы отсканировали для освоения",
        "portuguese": "Catálogos intuitivos das palavras que você digitalizou para domínio",
        "hindi": "शब्दों के सहज ज्ञान युक्त कैटलॉग जिन्हें आपने महारत के लिए स्कैन किया है",
        "english": "Intuitive catalogues of words you've scanned for mastery"
    }

}


export default function Onboarding({ navigation }) {
    const [chosenLanguage, setChosenLanguage] = useState("english")
    const [page, setPage] = useState(0)
    const [nextBtnDoneLoading, setNextBtnDoneLoading] = useState(false)

    const duration = 500
    const delay = 250

    function LanguageIcon({ emoji, language }) {
        return (
            <Pressable onPress={() => setChosenLanguage(language)} style={{ backgroundColor: "rgba(118, 118, 128, 0.12)", height: 60, width: 60, justifyContent: "center", alignItems: "center", borderRadius: 30, borderWidth: chosenLanguage === language ? 2 : 0 }}>
                <Text style={{ fontSize: 40, }}>{emoji}</Text>
            </Pressable>
        )
    }

    const rotate = useSharedValue("180deg")

    if (page == 0)
        return (
            <View style={{ backgroundColor: "#F5EEE5", alignItems: "center", flex: 1 }}>
                <Animated.Image key="image" entering={FadeIn.duration(duration).delay(delay)} exiting={FadeOut.duration(duration).delay(delay)} source={lexify} style={{ top: screenHeight * 0.21, position: "absolute", height: screenHeight * 0.3, width: screenHeight * 0.3, }} />
                <Animated.View key="flatlist" entering={FadeIn.duration(duration).delay(delay * 2)} exiting={FadeOut.duration(duration).delay(delay * 2)} style={{ width: "100%" }}>
                    <FlatList
                        data={data}
                        renderItem={({ item }) => <LanguageIcon language={item.language} emoji={item.emoji} />}
                        horizontal
                        contentContainerStyle={{ gap: 15, paddingLeft: 30, paddingRight: 30, paddingTop: 20, }}
                        showsHorizontalScrollIndicator={false}
                        style={{ position: "absolute", top: screenHeight * 0.53, }}
                    />
                </Animated.View>
                <Animated.View key="btn1" entering={FadeIn.duration(duration).delay(delay * 3)} exiting={FadeOut.duration(duration).delay(delay * 3)}>
                    <Pressable style={({ pressed }) => [styles.button, { backgroundColor: pressed ? "#67A4C9" : "#77bee9" }]} onPress={() => {
                        setPage(1)
                        rotate.value = withDelay(duration + delay, withTiming("360deg", { duration: 750 }))
                    }}>
                        <Text style={styles.buttonText}>{translations.next[chosenLanguage]}</Text>
                    </Pressable>
                </Animated.View>
            </View>
        )

    if (page == 1) {
        return (
            <View style={{ backgroundColor: "#F5EEE5", alignItems: "center", flex: 1 }}>
                <Pressable onPress={() => {
                    setPage(0)
                    rotate.value = "180deg"
                }} style={{ position: "absolute", left: 20, top: 55, width: 24, height: 24, justifyContent: "center", alignItems: 'center' }}>
                    <SFSymbol name="chevron.left" color="#000" size={24} />
                </Pressable>
                <Animated.View key="stuff" entering={FadeIn.duration(duration).delay(delay + duration)} exiting={FadeOut.duration(duration).delay(delay)} style={{ position: "absolute", top: screenHeight * 0.1, gap: 25, alignItems: "center", }}>
                    <Animated.View style={{ transform: [{ rotate: rotate }] }}>
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
                    </Animated.View>
                    <Text style={{ letterSpacing: 3, lineHeight: 30, fontSize: 20, fontFamily: "NewYorkLarge-Regular", alignSelf: "center", textAlign: "center", }}>{translations.built_for_immersion[chosenLanguage]}</Text>

                </Animated.View>

                <View style={{ position: "absolute", top: screenHeight * 0.49, gap: 25, width: screenWidth * 0.7 }}>
                    <Animated.View key="info-1" entering={FadeIn.duration(duration).delay(3 * delay + duration * 1.5)} exiting={FadeOut.duration(duration)} style={styles.listItem}>
                        <SFSymbol name="globe" size={28} color="black" />
                        <Text style={styles.listText}>{translations.convenient_translations_of_words_you_dont_know[chosenLanguage]}</Text>
                    </Animated.View>
                    <Animated.View key="info-2" entering={FadeIn.duration(duration).delay(4 * delay + duration * 1.5)} exiting={FadeOut.duration(duration)} style={styles.listItem}>
                        <SFSymbol name="rectangle.portrait.on.rectangle.portrait.fill" size={28} color="black" />
                        <Text style={styles.listText}>{translations.extensive_vocabulary_practice_with_ai_powered_training[chosenLanguage]}</Text>
                    </Animated.View>
                    <Animated.View key="info-3" entering={FadeIn.duration(duration).delay(5 * delay + duration * 1.5)} exiting={FadeOut.duration(duration)} style={styles.listItem}>
                        <SFSymbol name="character.book.closed.fill" size={28} color="black" />
                        <Text style={styles.listText}>{translations.intuitive_catalogues_of_words_youve_scanned_for_mastery[chosenLanguage]}</Text>
                    </Animated.View>
                </View>
                <Animated.View key="btn2" entering={FadeIn.duration(duration).delay(7 * delay + duration * 1.5).withCallback(() => {
                    runOnJS(setNextBtnDoneLoading)(true)
                })} exiting={FadeOut.duration(duration).delay(delay * 3)}>
                    <Pressable style={({ pressed }) => [styles.button, { backgroundColor: pressed ? "#67A4C9" : "#77bee9" }]} onPress={() => {if (nextBtnDoneLoading) navigation.navigate("SignUp", { chosenLanguage: chosenLanguage })}}>
                        <Text style={styles.buttonText}>{translations.next[chosenLanguage]}</Text>
                    </Pressable>
                </Animated.View>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    listItem: {
        flexDirection: "row",
        gap: 35,
        // justifyContent: "center"
        // alignItems: "center"
    },
    listText: {
        fontSize: 20,
        // fontFamily: "NewYorkLarge-Regular", 
        alignSelf: "center",
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
        top: screenHeight * 0.8,
        position: "absolute",

    },
    buttonText: {
        fontFamily: "SFPro-Regular",
        textAlign: "center",
        fontSize: 20,
    },
})