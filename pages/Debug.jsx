import { View, Text, SafeAreaView, Pressable, StyleSheet } from 'react-native'

import React, {useState, useEffect} from 'react'
import { GoogleGenerativeAI , HarmBlockThreshold, HarmCategory} from '@google/generative-ai'
import Config from "react-native-config"

import auth from '@react-native-firebase/auth';
import database from "@react-native-firebase/database"

export default function DebugPage({navigation}) {

  const genAI = new GoogleGenerativeAI(Config.API_KEY);

  const safetySetting = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySetting, generationConfig: { responseMimeType: "application/json" }},);

  const [response, setResponse] = useState(null)
  const [englishWord, setEnglishWord] = useState(null)
  const [englishDefinition, setEnglishDefinition] = useState(null)
  const [translatedWord, setTranslatedWord] = useState(null)
  const [translatedDefinition, setTranslatedDefinition] = useState(null)


  const define = async (word, language) => {

    console.log(Config.API_KEY)

    const prompt = `
    Word: ${word}
    Language: ${language}
    For the above word and language, provide its English definition, its translation in the provided language, and its definition in the provided language. Use this JSON schema:
    { "englishDefinition": "string", 
      "translatedWord": "string",
      "translatedDefinition": "string"
    }`

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = JSON.parse(response.text());
    setEnglishWord(word)
    setEnglishDefinition(text.englishDefinition)
    setTranslatedWord(text.translatedWord)
    setTranslatedDefinition(text.translatedDefinition)
    
    setResponse(JSON.stringify(text))
  }

  const addWord = () => {
    const uid = auth().currentUser.uid;
    database()
      .ref(`/${uid}/words`)
      .update({[englishWord]: {
        translatedWord: translatedWord,
        definition: englishDefinition,
        translatedDefinition: translatedDefinition
      }
      })
      .then(() => console.log("Done!"))
    }

  return (
    <SafeAreaView style={{alignItems: "center", }}>
      <Text>DebugPage</Text>
      <Pressable style={styles.debugButton} onPress={() => {define("man", "Spanish")}}>
        <Text>Define a word!</Text>
      </Pressable>
      <Pressable style={styles.debugButton} onPress={() => {addWord("word")}}>
        <Text>Add to database</Text>
      </Pressable>
      <Pressable style={styles.debugButton} onPress={() => {navigation.navigate("Home")}}>
        <Text>Go to home</Text>
      </Pressable>
      <Text>{response}</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  debugButton: {
    backgroundColor: "#FFCC32",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginBottom: 20,
    width: "90%"
  }
})