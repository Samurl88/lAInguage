import { View, Text, SafeAreaView, Pressable } from 'react-native'

import React, {useState, useEffect} from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Config from "react-native-config"



export default function DebugPage({navigation}) {

  const genAI = new GoogleGenerativeAI(Config.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" }});

  const [response, setResponse] = useState(null)
  useEffect(() => {
    
  }, [])
  

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

  return (
    <SafeAreaView>
      <Text>DebugPage</Text>
      <Pressable onPress={() => {define("Slowly", "Spanish")}}>
        <Text>Define a word!</Text>
      </Pressable>
      <Pressable onPress={() => {navigation.navigate("Home")}}>
        <Text>Go to home</Text>
      </Pressable>
      <Text>{response}</Text>
    </SafeAreaView>
  )
}