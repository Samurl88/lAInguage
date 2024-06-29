import { View, Text, SafeAreaView, Pressable } from 'react-native'

import React, {useState, useEffect} from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Config from "react-native-config"

import auth from '@react-native-firebase/auth';
import database from "@react-native-firebase/database"

export default function DebugPage({navigation}) {

  const genAI = new GoogleGenerativeAI(Config.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" }});

  const [response, setResponse] = useState(null)


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
    const text = response.text();
    setResponse(text)
    // console.log(JSON.parse(text));
  }

  const addWord = (word) => {
    console.log('word')
    const uid = auth().currentUser.uid;
    database()
      .ref(`/${uid}/words`)
      .set({
        englishWord: "Teddy",
        translatedWord: "Perro",
        definition: "The best dog",
        translatedDefinition: "El perro favorito"
      })
      .then(() => console.log("ofbjuewv"))
    console.log("ergobj")

    // console.log(database().ref("notes").set({work: "please"}))
    // database()
    // .ref('/')
    // .set({
    //   name: 'Ada Lovelace',
    //   age: 31,
    // })
    // .then(() => console.log('Data set.'));

    // database()
    // .ref('/').once('teddy').then(snapshot => {console.log(snapshot.val())})
    }

  return (
    <SafeAreaView>
      <Text>DebugPage</Text>
      <Pressable onPress={() => {define("Slowly", "Spanish")}}>
        <Text>Define a word!</Text>
      </Pressable>
      <Pressable onPress={() => {addWord("word")}}>
        <Text style={{fontSize: 100}}>Add to database</Text>
      </Pressable>
      <Pressable onPress={() => {navigation.navigate("Home")}}>
        <Text>Go to home</Text>
      </Pressable>
      <Text>{response}</Text>
    </SafeAreaView>
  )
}