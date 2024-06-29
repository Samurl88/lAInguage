import { View, Text, SafeAreaView, StyleSheet, Dimensions } from 'react-native'
import React, {useState, useEffect} from 'react'
import { SFSymbol } from 'react-native-sfsymbols';
import database from "@react-native-firebase/database"
import auth from "@react-native-firebase/auth"

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

export default function Dictionary() {

    const [words, setWords] = useState([])

    async function getWords() {
        let uid = auth().currentUser.uid;
        let option = "translatedDefinition"
        database()
            .ref(`${uid}/words`)
            .once('value')
            .then(snapshot => {
                let data = snapshot.val()
                setWords(data)
                console.log(data)
            })
    }

    useEffect(() => {
        getWords()
    }, [])


    if (words)
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F0E7", alignItems: "center" }}>
            <View style={styles.tabBar}>
                <SFSymbol name="camera.fill" size={18} color="#2F2C2A" />
                <SFSymbol name="doc.on.doc.fill" size={18} color="#2F2C2A" style={{ opacity: 0.21 }} />
                <SFSymbol name="character.book.closed.fill" size={18} color="#2F2C2A" style={{ opacity: 0.21 }} />
            </View>
            <Text style={styles.title}>Dictionary</Text>
            {
                
            }
            <Text></Text>
        </SafeAreaView>
    )
}

function Term({ word, translatedWord, translatedDefintion}) {
    return (
        <View>
            <Text>{word}</Text>
            <Text>{translatedWord} - {translatedDefintion}</Text>
        </View>
    )
} 

const styles = StyleSheet.create({
    title: {
        fontFamily: "NewYorkLarge-Semibold",
        fontSize: 34,
        position: "absolute",
        top: screenHeight * 0.15
        
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