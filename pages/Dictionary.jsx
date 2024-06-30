import { View, Text, SafeAreaView, StyleSheet, Dimensions, TextInput, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SFSymbol } from 'react-native-sfsymbols';
import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";
import { FlatList } from 'react-native-gesture-handler';

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

export default function Dictionary() {
    const [words, setWords] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [filteredFamiliar, setFamiliar] = useState([]);
    const [filteredUnfamiliar, setUnfamiliar] = useState([]);
    const [filteredMastered, setMastered] = useState([]);

    function search() {
        let tempFamiliar = [];
        let tempUnfamiliar = [];
        let tempMastered = [];

        for (let i = 0; i < words.length; i++) {
            try {
                if (!searchValue || words[i].word.toLowerCase().includes(searchValue.toLowerCase())) {
                    if (words[i].score == 0) {
                        tempUnfamiliar.push(words[i]);
                    } else if (words[i].score == 1) {
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
                search();  // Trigger the search to initialize filtered lists
            });
    }

    useEffect(() => {
        getWords();
    }, []);

    useEffect(() => {
        search();
    }, [searchValue, words]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F0E7", alignItems: "center" }}>
            <View style={styles.tabBar}>
                <SFSymbol name="camera.fill" size={18} color="#2F2C2A" />
                <SFSymbol name="doc.on.doc.fill" size={18} color="#2F2C2A" style={{ opacity: 0.21 }} />
                <SFSymbol name="character.book.closed.fill" size={18} color="#2F2C2A" style={{ opacity: 0.21 }} />
            </View>
            <View style={styles.container}>
                <Text style={styles.title}>Dictionary</Text>
                <View style={styles.searchBar}>
                    <View style={styles.seachIcon}>
                        <SFSymbol name="magnifyingglass" size={18} color="grey" />
                    </View>
                    <TextInput
                        placeholder='Search'
                        style={styles.searchInput}
                        value={searchValue}
                        onChangeText={(text) => setSearchValue(text)}
                    />
                </View>
                <ScrollView style={styles.scrollingContainer}>
                    {filteredUnfamiliar.length > 0 && (
                        <CategorySection title="Unfamiliar" color="#77BEE9" data={filteredUnfamiliar} />
                    )}
                    {filteredFamiliar.length > 0 && (
                        <CategorySection title="Familiar" color="green" data={filteredFamiliar} />
                    )}
                    {filteredMastered.length > 0 && (
                        <CategorySection title="Mastered" color="#FFD12D" data={filteredMastered} />
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

function CategorySection({ title, color, data }) {
    return (
        <>
            <View style={{ width: "92%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 10 }}>
                <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ width: 10, height: 10, backgroundColor: color, borderRadius: 5 }} />
                    <Text style={styles.category}>{title}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 15 }}>
                    <Text style={styles.seeAll}>See All</Text>
                    <SFSymbol name="chevron.right" size={20} color="black" />
                </View>
            </View>
            <FlatList
                data={data}
                contentContainerStyle={{ gap: 10 }}
                renderItem={({ item }) => <Term word={item.word} translatedWord={item.translatedWord} translatedDefinition={item.translatedDefinition} />}
                scrollEnabled={false}
            />
        </>
    );
}

function Term({ word, translatedWord, translatedDefinition }) {
    return (
        <View style={styles.termContainer}>
            <Text style={styles.termTitle}>{word}</Text>
            <Text style={styles.termSubtitle}>{translatedWord} - {translatedDefinition}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollingContainer: {
        height: screenHeight * 0.79
    },
    seachIcon: {
        position: "relative",
        alignSelf: "left",
        left: 15,
        top: 15
    },
    searchBar: {
        backgroundColor: "#D3D3D3",
        width: "90%",
        height: 30,
        borderRadius: 10,
    },
    searchInput: {
        paddingLeft: 30,
        fontSize: 22
    },
    container: {
        position: "absolute",
        top: screenHeight * 0.13,
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
        width: screenWidth * 0.9
    },
    termTitle: {
        fontFamily: "NewYorkLarge-Regular",
        fontSize: 20,
        paddingBottom: 10
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
