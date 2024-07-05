import { View, Text, SafeAreaView, StyleSheet, Dimensions, TextInput, ScrollView, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SFSymbol } from 'react-native-sfsymbols';
import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";
import { FlatList } from 'react-native-gesture-handler';
import ContextMenu from "react-native-context-menu-view";


const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;


export default function Dictionary({ language, translations, terms }) {
    const [words, setWords] = useState(terms);
    const [searchValue, setSearchValue] = useState(null);
    const [filteredFamiliar, setFamiliar] = useState(null);
    const [filteredUnfamiliar, setUnfamiliar] = useState(null);
    const [filteredMastered, setMastered] = useState(null);

    const [initialized, setInitialized] = useState(false)

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
        setFamiliar(tempFamiliar);
        setUnfamiliar(tempUnfamiliar);
        setMastered(tempMastered);
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
        getWords();
    }, []);

    useEffect(() => {
        if (searchValue || searchValue == "")
            search(words);
    }, [searchValue]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F0E7", alignItems: "center" }}>
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
                <ScrollView style={styles.scrollingContainer} contentContainerStyle={{ paddingBottom: 40 }}>
                    {filteredUnfamiliar?.length > 0 && (
                        <CategorySection title={translations.unfamiliar[language]} color="#77BEE9" data={filteredUnfamiliar} />
                    )}
                    {filteredFamiliar?.length > 0 && (
                        <CategorySection title={translations.familiar[language]} color="green" data={filteredFamiliar} />
                    )}
                    {filteredMastered?.length > 0 && (
                        <CategorySection title={translations.mastered[language]} color="#FFD12D" data={filteredMastered} />
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

function CategorySection({ title, color, data }) {
    return (
        <View style={{ paddingBottom: 10, alignItems: "center" }}>
            {/* <View style={{ width: "92%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 10 }}>
                <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center", paddingTop: 15, zIndex: 100 }}>
                    <View style={{ width: 10, height: 10, backgroundColor: color, borderRadius: 5 }} />
                    <Text style={styles.category}>{title}</Text>
                </View>
            </View> */}
            <FlatList
                data={data}
                contentContainerStyle={{ gap: 10, padding: 10, width: screenWidth, alignItems: "center" }}
                renderItem={({ item }) => <Term title={item.title} color={item.color} word={item.word} translatedWord={item.translatedWord} translatedDefinition={item.translatedDefinition} />}
                scrollEnabled={false}

            />
        </View>
    );
}

function Term({ title, color, word, translatedWord, translatedDefinition }) {
    if (title)
        // console.log(title)
        return (
            <View style={{ flexDirection: "row", gap: 10, width: screenWidth * 0.92, alignItems: "center", paddingTop: 15, }}>
                <View style={{ width: 10, height: 10, backgroundColor: color, borderRadius: 5 }} />
                <Text style={styles.category}>{title}</Text>
            </View>
        )
    return (
        <ContextMenu
            actions={[{ title: "Remove term", destructive: true, systemIcon: "xmark" }]}
        >
            <Pressable style={styles.termContainer}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "95%", paddingBottom: 12, }}>
                    <Text style={styles.termTitle}>{word}</Text>
                    <SFSymbol name="speaker.wave.2.fill" size={20} color="#77BEE9" />
                </View>
                <Text style={styles.termSubtitle}>{translatedWord} · {translatedDefinition}</Text>
            </Pressable>
        </ContextMenu>
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
        alignItems: "center"
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