import { View, Text, SafeAreaView, StyleSheet, Dimensions, TextInput, ScrollView, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SFSymbol } from 'react-native-sfsymbols';
import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";
import { FlatList } from 'react-native-gesture-handler';
import ContextMenu from "react-native-context-menu-view";
import Animated, { FadeIn, FadeOut, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import Tts from 'react-native-tts';

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

languageToId = {
    "arabic": {"identifier": "com.apple.ttsbundle.Maged-compact"},
    "czech": {"identifier": "com.apple.ttsbundle.Zuzana-compact"},
    "danish": {"identifier": "com.apple.ttsbundle.Sara-compact"},
    "german": {"identifier": "com.apple.ttsbundle.Anna-compact"},
    "greek": {"identifier": "com.apple.ttsbundle.Melina-compact"},
    "english": {"identifier": "com.apple.ttsbundle.Samantha-compact"},
    "spanish": {"identifier": "com.apple.ttsbundle.Monica-compact"},
    "finnish": {"identifier": "com.apple.ttsbundle.Satu-compact"},
    "french": {"identifier": "com.apple.ttsbundle.Thomas-compact"},
    "hebrew": {"identifier": "com.apple.ttsbundle.Carmit-compact"},
    "hindi": {"identifier": "com.apple.ttsbundle.Lekha-compact"},
    "hungarian": {"identifier": "com.apple.ttsbundle.Mariska-compact"},
    "indonesian": {"identifier": "com.apple.ttsbundle.Damayanti-compact"},
    "italian": {"identifier": "com.apple.ttsbundle.Alice-compact"},
    "japanese": {"identifier": "com.apple.ttsbundle.Kyoko-compact"},
    "korean": {"identifier": "com.apple.ttsbundle.Yuna-compact"},
    "dutch": {"identifier": "com.apple.ttsbundle.Xander-compact"},
    "norwegian": {"identifier": "com.apple.ttsbundle.Nora-compact"},
    "polish": {"identifier": "com.apple.ttsbundle.Zosia-compact"},
    "portuguese": {"identifier": "com.apple.ttsbundle.Luciana-compact"},
    "romanian": {"identifier": "com.apple.ttsbundle.Ioana-compact"},
    "russian": {"identifier": "com.apple.ttsbundle.Milena-compact"},
    "slovak": {"identifier": "com.apple.ttsbundle.Laura-compact"},
    "swedish": {"identifier": "com.apple.ttsbundle.Alva-compact"},
    "thai": {"identifier": "com.apple.ttsbundle.Kanya-compact"},
    "turkish": {"identifier": "com.apple.ttsbundle.Yelda-compact"},
    "chinese": {"identifier": "com.apple.ttsbundle.Ting-Ting-compact"}
}

export default function Dictionary({ language, translations, terms }) {
    const [words, setWords] = useState();
    const [searchValue, setSearchValue] = useState(null);
    const [wordCounts, setWordCounts] = useState(null)
    const [data, setData] = useState(null)

    const [onlyUnfamiliar, setOnlyUnfamiliar] = useState(false);
    const [onlyFamiliar, setOnlyFamiliar] = useState(false);
    const [onlyMastered, setOnlyMastered] = useState(false);


    function search(words) {
        let tempFamiliar = [{ title: translations.familiar[language], color: "green", score: 1 }];
        let tempUnfamiliar = [{ title: translations.unfamiliar[language], color: "#77bee9", score: 0 }];
        let tempMastered = [{ title: translations.mastered[language], color: "#FFD12D", score: 3 }];

        for (let i = 0; i < words.length; i++) {
            try {
                if (!searchValue || words[i].word.toLowerCase().search(searchValue.toLowerCase()) == 0) {
                    if (words[i].score == 0) {
                        tempUnfamiliar.push(words[i]);
                    } else if ((words[i].score == 1 || words[i].score == 2)) {
                        tempFamiliar.push(words[i]);
                    } else if (words[i].score == 3) {
                        tempMastered.push(words[i]);
                    }
                }
            } catch {
                continue;
            }
        }
        tempFamiliar = tempFamiliar.length > 1 ? tempFamiliar : []
        tempUnfamiliar = tempUnfamiliar.length > 1 ? tempUnfamiliar : []
        tempMastered = tempMastered.length > 1 ? tempMastered : []

        setWordCounts({ familiar: tempFamiliar.length - 1, unfamiliar: tempUnfamiliar.length - 1, mastered: tempMastered.length - 1 })

        setData(tempUnfamiliar.concat(tempFamiliar).concat(tempMastered))
    }

    useEffect(() => {
        if (terms) {
            let words = [];
            for (const word in terms) {
                let obj = terms[word];
                obj.word = word;
                words.push(obj);
            }
            setWords(words);
            search(words);
        }
    }, []);

    useEffect(() => {
        if (searchValue || searchValue == "")
            search(words);
    }, [searchValue]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F5EEE5", alignItems: "center", }}>
            <View style={styles.container}>
                {/* <Pressable onPress={() => {
                    let uid = auth().currentUser.uid
                    database()
                        .ref(`${uid}/words`)
                        .update({
                            tt: {
                                translatedWord: "translatedWord",
                                translatedDefinition: "translatedDefinition",
                                definition: "definition",
                                score: 0
                            }
                        })
                }}>
                    <Text>Make new term</Text>
                </Pressable> */}
                <Text style={styles.title}>{translations.dictionary[language]}</Text>

                <View style={{ gap: 10, width: screenWidth, alignItems: "center" }}>
                    <View style={{ backgroundColor: "rgba(118, 118, 128, 0.12)", height: 35, borderRadius: 10, alignItems: "center", flexDirection: "row", width: screenWidth * 0.9 }}>
                        <SFSymbol name="magnifyingglass" size={18} color="grey" style={{ left: screenWidth * 0.05, position: "absolute" }} />
                        <TextInput
                            placeholder={translations.search[language]}
                            style={styles.searchInput}
                            value={searchValue}
                            onChangeText={(text) => setSearchValue(text)}
                        />
                    </View>

                    {/* Filter buttons height: screenHeight * 0.036*/}
                    <ScrollView contentContainerStyle={{ paddingLeft: screenWidth * 0.05, paddingRight: screenWidth * 0.05, gap: 10 }} horizontal style={{ flexDirection: "row", width: screenWidth, height: screenHeight * 0.036 }}>
                        {wordCounts?.unfamiliar > 0
                            ? <Pressable style={onlyUnfamiliar ? styles.categoryBtnSelected : styles.categoryBtn} onPress={() => {
                                if (onlyUnfamiliar) {
                                    setOnlyUnfamiliar(false)
                                } else {
                                    setOnlyUnfamiliar(true)
                                    setOnlyFamiliar(false)
                                    setOnlyMastered(false)
                                }
                            }}>
                                <View style={{ width: 10, height: 10, backgroundColor: "#77bee9", borderRadius: 5 }} />
                                <Text style={styles.categoryText}>Unfamiliar</Text>
                            </Pressable>
                            : null
                        }
                        {wordCounts?.familiar > 0
                            ? <Pressable style={onlyFamiliar ? styles.categoryBtnSelected : styles.categoryBtn} onPress={() => {
                                if (onlyFamiliar) {
                                    setOnlyFamiliar(false)
                                } else {
                                    setOnlyUnfamiliar(false)
                                    setOnlyFamiliar(true)
                                    setOnlyMastered(false)
                                }
                            }}>
                                <View style={{ width: 10, height: 10, backgroundColor: "green", borderRadius: 5 }} />
                                <Text style={styles.categoryText}>Familiar</Text>
                            </Pressable>
                            : null
                        }
                        {wordCounts?.mastered > 0
                            ? <Pressable style={onlyMastered ? styles.categoryBtnSelected : styles.categoryBtn} onPress={() => {
                                if (onlyMastered) {
                                    setOnlyMastered(false)
                                } else {
                                    setOnlyUnfamiliar(false)
                                    setOnlyFamiliar(false)
                                    setOnlyMastered(true)
                                }
                            }}>
                                <View style={{ width: 10, height: 10, backgroundColor: "#FFD12D", borderRadius: 5 }} />
                                <Text style={styles.categoryText}>Mastered</Text>
                            </Pressable>
                            : null
                        }
                    </ScrollView>
                </View>
                {terms
                    ? <Animated.View key="flatlist" exiting={FadeOut.duration(750)} style={{ width: screenWidth, flex: 1, alignItems: "center", }}>
                        <FlatList
                            data={data}
                            contentContainerStyle={{ padding: 10, width: screenWidth, alignItems: "center", paddingBottom: 160 }}
                            renderItem={({ item }) =>
                                <Term title={item.title} color={item.color} word={item.word} translatedWord={item.translatedWord}
                                    translatedDefinition={item.translatedDefinition} score={item.score} wordCounts={wordCounts} setWordCounts={setWordCounts}
                                    onlyUnfamiliar={onlyUnfamiliar} onlyFamiliar={onlyFamiliar} onlyMastered={onlyMastered} originalLanguage={item.originalLanguage}
                                />}
                        />
                    </Animated.View>
                    : <>
                        <Animated.Text entering={words ? FadeIn.duration(750).delay(750) : null} key="no-terms" style={{ paddingTop: 20, fontSize: 20, fontFamily: "NewYorkLarge-Regular", color: "gray", top: screenHeight * 0.2 }}>
                            {translations.view_all_your_terms_here[language]}
                        </Animated.Text>
                    </>
                }
            </View>
        </SafeAreaView >
    );
}



function Term({ title, color, word, translatedWord, translatedDefinition, score, wordCounts, setWordCounts, onlyUnfamiliar, onlyFamiliar, onlyMastered, originalLanguage }) {
    const termOpacity = useSharedValue(1)
    const termHeight = useSharedValue(screenHeight * 0.16)
    const marginTop = useSharedValue(12)

    const titleOpacity = useSharedValue(1)
    const titleHeight = useSharedValue(screenHeight * 0.055)

    const [inProgress, setInProgress] = useState(false)

    useEffect(() => {
        Tts.setIgnoreSilentSwitch("ignore");
        Tts.addEventListener('tts-start', () => {
            setInProgress(true);
        });
        Tts.addEventListener('tts-finish', () => setInProgress(false));
    }, [])

    // Logic for filter buttons
    if ((onlyUnfamiliar && score != 0) || (onlyFamiliar && (score > 2 || score < 1)) || (onlyMastered && score != 3)) return

    if (title) {
        if ((score === 0 && wordCounts.unfamiliar <= 0) || (score === 1 && wordCounts.familiar <= 0) || (score === 3 && wordCounts.mastered <= 0)) {
            titleOpacity.value = withTiming(0, { duration: 750 })
            titleHeight.value = withDelay(750, withTiming(0, { duration: 750 }))
        }

        // entering={FadeIn.duration(500).delay(500)} exiting={FadeOut.duration(500)}
        return (
            <Animated.View key={title} style={{ opacity: titleOpacity, height: titleHeight, flexDirection: "row", gap: 10, width: screenWidth * 0.92, alignItems: "center", paddingTop: 15, }}>
                <View style={{ width: 10, height: 10, backgroundColor: color, borderRadius: 5 }} />
                <Text style={styles.category}>{title}</Text>
            </Animated.View>
        )
    } else
        return (
            <Animated.View key={word} style={{ opacity: termOpacity, height: termHeight, marginTop: marginTop }}>
                <ContextMenu
                    actions={[{ title: "Remove term", destructive: true, systemIcon: "xmark" }]}
                    onPress={async (e) => {
                        if (e.nativeEvent.name == "Remove term") {
                            termOpacity.value = withTiming(0, { duration: 750 })
                            termHeight.value = withDelay(750, withTiming(0, { duration: 750 }))
                            marginTop.value = withDelay(750, withTiming(0, { duration: 750 }))


                            let newWordCounts = {}
                            if (score == 0) {
                                newWordCounts = { "unfamiliar": wordCounts.unfamiliar - 1, "familiar": wordCounts.familiar, "mastered": wordCounts.mastered }
                            } else if (score < 3) {
                                newWordCounts = { "unfamiliar": wordCounts.unfamiliar, "familiar": wordCounts.familiar - 1, "mastered": wordCounts.mastered }
                            } else {
                                newWordCounts = { "unfamiliar": wordCounts.unfamiliar, "familiar": wordCounts.familiar, "mastered": wordCounts.mastered - 1 }
                            }

                            setWordCounts(newWordCounts)

                            let uid = auth().currentUser.uid;
                            database()
                                .ref(`${uid}/words/${word}`)
                                .set(null)

                        }
                    }}
                >
                    <View style={{ ...styles.termContainer, }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "95%", paddingBottom: 12, alignItems: "center" }}>
                            <Text style={styles.termTitle}>{word}</Text>
                            <Pressable style={{ justifyContent: "center", alignItems: "center", width: 30, height: 30, right: -10}} onPress={() => {
                                if (!inProgress)
                                    Tts.speak(word, {
                                        iosVoiceId: languageToId[originalLanguage].identifier,
                                        rate: 0.4
                                    });
                            }}>
                                <SFSymbol name="speaker.wave.2.fill" size={20} color="#77BEE9" opacity={inProgress ? 0.5 : 1} />
                            </Pressable>
                        </View>
                        <Text style={styles.termSubtitle}>{translatedWord} · {translatedDefinition}</Text>
                    </View>
                </ContextMenu>
            </Animated.View>
        );
}


const styles = StyleSheet.create({
    categoryBtn: {
        flexDirection: "row",
        gap: 10,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 10,
        backgroundColor: "rgba(118, 118, 128, 0.12)"
    },
    categoryBtnSelected: {
        flexDirection: "row",
        gap: 10,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 9,
        paddingRight: 9,
        borderRadius: 10,
        // backgroundColor: "#2F2C2A"
        backgroundColor: "rgba(118, 118, 128, 0.12)",
        borderColor: "#2F2C2A",
        borderWidth: 1

    },
    categoryText: {
        fontFamily: "NewYorkLarge-Regular",
        fontSize: 17
    },
    categoryTextSelected: {
        fontFamily: "NewYorkLarge-Regular",
        fontSize: 17,
        // color: "white"
    },
    scrollingContainer: {
        height: screenHeight * 0.79,
        width: screenWidth,
    },
    seachIcon: {
        alignSelf: "flex-start",
        gap: 10
    },
    searchBar: {
        backgroundColor: "rgba(118, 118, 128, 0.12)",
        width: "90%",
        height: 35,
        borderRadius: 10,
        width: screenWidth * 0.9,
        justifyContent: "center",
    },
    searchInput: {
        paddingLeft: 40,
        fontSize: 18,
        width: "100%"
    },
    container: {
        position: "absolute",
        top: screenHeight * 0.15,
        alignItems: "center",
        flex: 1,
        height: screenHeight,
        width: screenWidth
    },
    title: {
        fontFamily: "NewYorkLarge-Semibold",
        fontSize: 34,
        paddingBottom: 15
    },
    category: {
        fontFamily: "NewYorkLarge-Semibold",
        fontSize: 25,
    },
    seeAll: {
        fontSize: 20
    },
    termContainer: {
        backgroundColor: "white",
        borderRadius: 26,
        padding: 20,
        width: screenWidth * 0.9,
        height: screenHeight * 0.16,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 2,
        shadowColor: "black",
        shadowOpacity: 0.2,
    },
    termTitle: {
        fontFamily: "NewYorkLarge-Regular",
        fontSize: 20,
    },
    termSubtitle: {
        fontSize: 17,
        fontFamily: "SFPro-Regular"
    },
    tabBar: {
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        position: "absolute",
        zIndex: 100,
        top: screenHeight * 0.07,
        justifyContent: "center",
        alignSelf: "center",
        flexDirection: "row",
        gap: 35,
        borderRadius: 60,
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 25,
        paddingRight: 25
    },
});