import { View, Text, SafeAreaView, StyleSheet, Dimensions, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react';
import { SearchBar } from 'react-native-elements';
import { SFSymbol } from 'react-native-sfsymbols';
// import { Icon } from "react-native-ui-devkit";
import database from "@react-native-firebase/database"
import auth from "@react-native-firebase/auth"
import { FlatList } from 'react-native-gesture-handler';

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

export default function Dictionary() {

    const [words, setWords] = useState([])

    const [searchValue, setSearchValue] = useState(null);

    // const filteredWords = words.filter(word =>
    //     word.word.toLowerCase().includes(searchValue.toLowerCase()) ||
    //     word.translatedWord.toLowerCase().includes(searchValue.toLowerCase()) ||
    //     word.translatedDefinition.toLowerCase().includes(searchValue.toLowerCase())
    // );
    function search() {
        setWords(words.filter(word =>
            word.word.toLowerCase().includes(searchValue.toLowerCase()) ||
            word.translatedWord.toLowerCase().includes(searchValue.toLowerCase()) ||
            word.translatedDefinition.toLowerCase().includes(searchValue.toLowerCase())
        ));
    }
    async function getWords() {
        let uid = auth().currentUser.uid;
        let option = "translatedDefinition"
        database()
            .ref(`${uid}/words`)
            .once('value')
            .then(snapshot => {
                let data = snapshot.val()

                let words = []
                for (const word in data) {
                    // console.log(data[word])
                    let obj = data[word]
                    obj.word = word
                    words.push(obj)
                }
                setWords(words)
            })
    }

    useEffect(() => {
        getWords()
    }, [])

    useEffect(() => {
        console.log(searchValue)
    }, [searchValue])


    if (words.length)
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F0E7", alignItems: "center" }}>
                <View style={styles.tabBar}>
                    <SFSymbol name="camera.fill" size={18} color="#2F2C2A" />
                    <SFSymbol name="doc.on.doc.fill" size={18} color="#2F2C2A" style={{ opacity: 0.21 }} />
                    <SFSymbol name="character.book.closed.fill" size={18} color="#2F2C2A" style={{ opacity: 0.21 }} />
                </View>
                <View style={styles.container}>

                    <Text style={styles.title}>Dictionary</Text>
                    {/* <SearchBar></SearchBar> */}
                    <View style={styles.searchBar}>
                        <View style={styles.seachIcon}>
                            <SFSymbol name="magnifyingglass" size={18} color="grey" />
                        </View>

                        {/* <Icon style={styles.searchIcon} name="ios-search" size={20} color="#000" /> */}
                        <TextInput placeholder='Search' style={styles.searchInput} value={searchValue} onChangeText={(text) => {
                            setSearchValue(text)
                            search();
                        }}></TextInput>
                    </View>

                    <View style={{ width: "92%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 10 }}>
                        <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center" }}>
                            <View style={{ width: 10, height: 10, backgroundColor: "#77BEE9", borderRadius: 5 }} />
                            <Text style={styles.category}>Unfamiliar</Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 15 }}>
                            <Text style={styles.seeAll}>See All</Text>
                            <SFSymbol name="chevron.right" size={20} color="black" />
                        </View>
                    </View>
                    <FlatList
                        data={words}
                        contentContainerStyle={{ gap: 10 }}
                        renderItem={({ item }) => {
                            console.log(item)
                            return (<Term word={item.word} translatedWord={item.translatedWord} translatedDefinition={item.translatedDefinition} />)
                        }}
                        scrollEnabled={false}
                    />
                    <Text></Text>
                </View>
            </SafeAreaView>
        )
}

function Term({ word, translatedWord, translatedDefinition }) {
    return (
        <View style={styles.termContainer}>
            <Text style={styles.termTitle}>{word}</Text>
            <Text style={styles.termSubtitle}>{translatedWord} - {translatedDefinition}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
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
})