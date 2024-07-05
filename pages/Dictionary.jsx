import { View, Text, SafeAreaView, StyleSheet, Dimensions, TextInput, ScrollView, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SFSymbol } from 'react-native-sfsymbols';
import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";
import { FlatList } from 'react-native-gesture-handler';
import ContextMenu from "react-native-context-menu-view";
import Animated, { FadeOut, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';


const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;


export default function Dictionary({ language, translations, terms }) {
    const [words, setWords] = useState();
    const [searchValue, setSearchValue] = useState(null);
    const [wordCounts, setWordCounts] = useState(null)

    const [initialized, setInitialized] = useState(false)

    const [data, setData] = useState(null)

    function search(words) {
        let tempFamiliar = [{ title: translations.familiar[language], color: "green", score: 1 }];
        let tempUnfamiliar = [{ title: translations.unfamiliar[language], color: "#77bee9", score: 0 }];
        let tempMastered = [{ title: translations.mastered[language], color: "#FFD12D", score: 3 }];

        for (let i = 0; i < words.length; i++) {
            try {
                if (!searchValue || words[i].word.toLowerCase().includes(searchValue.toLowerCase())) {
                    if (words[i].score == 0) {
                        // console.log(words[i])
                        tempUnfamiliar.push(words[i]);
                    } else if (words[i].score < 3) {
                        tempFamiliar.push(words[i]);
                    } else {
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

        setWordCounts({familiar: tempFamiliar.length - 1, unfamiliar: tempUnfamiliar.length - 1, mastered: tempMastered.length - 1})

        // console.log(tempUnfamiliar.concat(tempFamiliar).concat(tempMastered))
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
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F0E7", alignItems: "center", }}>
            <View style={styles.container}>
                <Text style={styles.title}>{translations.dictionary[language]}</Text>
                <View style={styles.searchBar}>
                    <View style={styles.seachIcon}>
                        <SFSymbol name="magnifyingglass" size={18} color="grey" />
                    </View>
                    <TextInput
                        placeholder={translations.search[language]}
                        style={styles.searchInput}
                        value={searchValue}
                        onChangeText={(text) => setSearchValue(text)}
                    />
                </View>
                <FlatList
                    data={data}
                    contentContainerStyle={{ padding: 10, width: screenWidth, alignItems: "center", paddingBottom: 160 }}
                    renderItem={({ item }) => <Term title={item.title} color={item.color} word={item.word} translatedWord={item.translatedWord} translatedDefinition={item.translatedDefinition} 
                                                score={item.score} wordCounts={wordCounts} setWordCounts={setWordCounts} />}
                />
            </View>
        </SafeAreaView>
    );
}



function Term({ title, color, word, translatedWord, translatedDefinition, score, wordCounts, setWordCounts }) {
    const termOpacity = useSharedValue(1)
    const termHeight = useSharedValue(screenHeight * 0.16)
    const marginTop = useSharedValue(12)

    const titleOpacity = useSharedValue(1)
    const titleHeight = useSharedValue(screenHeight * 0.055)


    if (title) {

        if ((score === 0 && wordCounts.unfamiliar <= 0) || (score === 1 && wordCounts.familiar <= 0) || (score === 3 && wordCounts.mastered <= 0) ) {
            titleOpacity.value = withTiming(0, {duration: 750})
            titleHeight.value = withDelay(750, withTiming(0, {duration: 750}))
        }
        
        return (
            <Animated.View key={title} style={{ opacity: titleOpacity, height: titleHeight, flexDirection: "row", gap: 10, width: screenWidth * 0.92, alignItems: "center", paddingTop: 15,  }}>
                <View style={{ width: 10, height: 10, backgroundColor: color, borderRadius: 5 }} />
                <Text style={styles.category}>{title}</Text>
            </Animated.View>
        )
    } else
    return (
        <Animated.View key={word} style={{  opacity: termOpacity, height: termHeight, marginTop: marginTop }}>
            <ContextMenu
                actions={[{ title: "Remove term", destructive: true, systemIcon: "xmark" }]}
                onPress={async (e) => {
                    if (e.nativeEvent.name == "Remove term") {
                        termOpacity.value = withTiming(0, {duration: 750})
                        termHeight.value = withDelay(750, withTiming(0, {duration: 750}))
                        marginTop.value = withDelay(750, withTiming(0, {duration: 750}))
                        
                        
                        let newWordCounts = {}
                        if (score == 0) {
                            newWordCounts = {"unfamiliar": wordCounts.unfamiliar - 1, "familiar": wordCounts.familiar, "mastered": wordCounts.mastered}
                        } else if (score < 3) {
                            newWordCounts = {"unfamiliar": wordCounts.unfamiliar, "familiar": wordCounts.familiar - 1, "mastered": wordCounts.mastered}
                        } else {
                            newWordCounts = {"unfamiliar": wordCounts.unfamiliar, "familiar": wordCounts.familiar, "mastered": wordCounts.mastered - 1}
                        }

                        setWordCounts(newWordCounts)
                    }
                }}
            >
                <View style={{...styles.termContainer, }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "95%", paddingBottom: 12, }}>
                        <Text style={styles.termTitle}>{word}</Text>
                        <SFSymbol name="speaker.wave.2.fill" size={20} color="#77BEE9" />
                    </View>
                    <Text style={styles.termSubtitle}>{translatedWord} · {translatedDefinition}</Text>
                </View>
            </ContextMenu>
        </Animated.View>
    );
}


const styles = StyleSheet.create({
    scrollingContainer: {
        height: screenHeight * 0.79,
        width: screenWidth,
    },
    seachIcon: {
        position: "relative",
        alignSelf: "left",
        left: 20,
        top: 15
    },
    searchBar: {
        backgroundColor: "rgba(118, 118, 128, 0.12)",
        width: "90%",
        height: 35,
        borderRadius: 10,
        width: screenWidth * 0.9,
        justifyContent: "center"
    },
    searchInput: {
        paddingLeft: 40,
        fontSize: 22,

    },
    container: {
        position: "absolute",
        top: screenHeight * 0.15,
        alignItems: "center",
        flex: 1,
        height: screenHeight,
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