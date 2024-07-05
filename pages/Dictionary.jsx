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

    const [initialized, setInitialized] = useState(false)

    const [data, setData] = useState(null)

    function search(words) {
        console.log("WORDS" + words.length)
        let tempFamiliar = [{ title: translations.familiar[language], color: "green" }];
        let tempUnfamiliar = [{ title: translations.unfamiliar[language], color: "#77bee9" }];
        let tempMastered = [{ title: translations.mastered[language], color: "#FFD12D" }];

        for (let i = 0; i < words.length; i++) {
            try {
                if (!searchValue || words[i].word.toLowerCase().includes(searchValue.toLowerCase())) {
                    if (words[i].score == 0) {
                        console.log(words[i])
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

        // console.log(tempUnfamiliar.concat(tempFamiliar).concat(tempMastered))
        setData(tempUnfamiliar.concat(tempFamiliar).concat(tempMastered))

    }

    async function getWords() {
        let uid = auth().currentUser.uid;
        database()
            .ref(`${uid}/words`)
            .once('value')
            .then(snapshot => {
                let data = snapshot.val();
                let words = [];
                for (const word in data) {
                    let obj = data[word];
                    obj.word = word;
                    words.push(obj);
                }
                setWords(words);
                search(words);  // Trigger the search to initialize filtered lists
            });
    }

    useEffect(() => {
        if (terms) {
            console.log("TERMSSS")
            console.log(terms)
            let words = [];
            for (const word in terms) {
                let obj = terms[word];
                obj.word = word;
                words.push(obj);
            }
            setWords(words);
            search(words);
        }
    }, [terms]);

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
                    renderItem={({ item }) => <Term title={item.title} color={item.color} word={item.word} translatedWord={item.translatedWord} translatedDefinition={item.translatedDefinition} />}
                />
            </View>
        </SafeAreaView>
    );
}

function Term({ title, color, word, translatedWord, translatedDefinition }) {
    const termOpacity = useSharedValue(1)
    const termHeight = useSharedValue(screenHeight * 0.16)


    if (title)
        return (
            <View style={{ flexDirection: "row", gap: 10, width: screenWidth * 0.92, alignItems: "center", paddingTop: 15, }}>
                <View style={{ width: 10, height: 10, backgroundColor: color, borderRadius: 5 }} />
                <Text style={styles.category}>{title}</Text>
            </View>
        )
    return (
        <Animated.View key={word} style={{  opacity: termOpacity, height: termHeight }}>
            <ContextMenu
                actions={[{ title: "Remove term", destructive: true, systemIcon: "xmark" }]}
                onPress={async (e) => {
                    if (e.nativeEvent.name == "Remove term") {
                        console.log("E")
                        termOpacity.value = withTiming(0, {duration: 750})
                        termHeight.value = withDelay(750, withTiming(0))
                        // let uid = auth().currentUser.uid;
                        // await database()
                        //     .ref(`${uid}/words/${word}`)
                        //     .set(null)
                    }
                }}
            >
                <Animated.View style={{...styles.termContainer, }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "95%", paddingBottom: 12, }}>
                        <Text style={styles.termTitle}>{word}</Text>
                        <SFSymbol name="speaker.wave.2.fill" size={20} color="#77BEE9" />
                    </View>
                    <Text style={styles.termSubtitle}>{translatedWord} · {translatedDefinition}</Text>
                </Animated.View>
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