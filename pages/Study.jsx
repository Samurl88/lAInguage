import { View, Text, SafeAreaView, Pressable, StyleSheet, FlatList, Dimensions, Image } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Animated, { useSharedValue, interpolate, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Config from "react-native-config"
import auth from '@react-native-firebase/auth';
import database from "@react-native-firebase/database";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

export default function StudyPage({ navigation }) {
  const [flashcards, setFlashcards] = useState([]);

  async function createMCQs(flashcardData) {
    const tempData = []
    for (let i = 0; i < flashcardData.length; i++) {
      tempData.push({
        "word": flashcardData.front,
        "answer": flashcardData.back
      })
      console.log(tempData + "sup there my friend")
    }
  }

  function createFlashcards() {
    let uid = auth().currentUser.uid;
    let option = "translatedDefinition";
    database()
      .ref(`${uid}/words`)
      .once('value')
      .then(snapshot => {
        let words = snapshot.val();

        let flashcards = [];
        for (const word in words) {
          flashcards.push({ front: word, back: words[word]["translatedDefinition"], frontFacing: true, score: words[word]["score"] });
        }
        createMCQs(flashcards)
        setFlashcards(flashcards);
      });
  }

  useEffect(() => {
    createFlashcards();
  }, []);

  const ref = useRef();

  return (
    <SafeAreaView style={{ justifyContent: "center", alignItems: "center", backgroundColor: "#F5EEE5", height: screenHeight }}>
      <Image source={{ uri: "https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Item_Primogem.png/revision/latest?cb=20201117071158" }} style={{ width: 35, height: 35, position: "absolute", top: 70, left: 30 }} />
      <Text style={{ position: "absolute", top: 75, fontSize: 22, left: 60 }}>4</Text>
      <Text style={styles.title}>Practice</Text>
      <Image source={{ uri: "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png" }} style={{ width: 35, height: 35, position: "absolute", top: 70, right: 30 }} />

      {flashcards.length ? (
        <FlatList
          data={flashcards}
          ref={ref}
          horizontal
          renderItem={({ item, index }) => (
            <Flashcard
              key={item.front}
              front={item.front}
              back={item.back}
              frontFacing={item.frontFacing}
              toggleFacing={() => {
                const newFlashcards = [...flashcards];
                newFlashcards[index].frontFacing = !newFlashcards[index].frontFacing;
                setFlashcards(newFlashcards);
              }}
              score={item.score}
            />
          )}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.front}
          style={{ zIndex: 100 }}
        />
      ) : null}
    </SafeAreaView>
  );
}

function Flashcard({ front, back, frontFacing, toggleFacing }) {
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

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySetting, generationConfig: { responseMimeType: "application/json" } },);

  const [score, setScore] = useState(0);

  function getScore() {
    let uid = auth().currentUser.uid;
    database()
      .ref(`${uid}/words/${front}`)
      .once('value')
      .then(snapshot => {
        let word = snapshot.val();
        let currentScore = word["score"] || 0;

        setScore(currentScore)
        console.log(currentScore)
      })
      .catch(error => {
        console.error("Error reading score: ", error);
      });
  }
  useEffect(() => {
    getScore();
  }, [])

  function correct() {
    let uid = auth().currentUser.uid;
    database()
      .ref(`${uid}/words/${front}`)
      .once('value')
      .then(snapshot => {
        let word = snapshot.val();
        let currentScore = word["score"] || 0;
        let newScore = currentScore + 1;

        // Update the score in Firebase
        database().ref(`${uid}/words/${front}`).update({ score: newScore });
      })
      .catch(error => {
        console.error("Error updating score: ", error);
      });
  }
  const spin = useSharedValue(frontFacing ? 0 : 1);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spinVal = interpolate(spin.value, [0, 1], [0, 180]);
    return {
      transform: [
        {
          rotateX: withTiming(`${spinVal}deg`, { duration: 500 }),
        },
      ],
    };
  }, []);

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spinVal = interpolate(spin.value, [0, 1], [180, 360]);
    return {
      transform: [
        {
          rotateX: withTiming(`${spinVal}deg`, { duration: 500 }),
        },
      ],
    };
  }, []);

  const handlePress = () => {
    spin.value = spin.value ? 0 : 1;
    toggleFacing();
  };
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function getMultipleChoiceQuestion() {
    let rawResponse = {
      "question": "What does " + front + " mean?",
      "choices": {
        "A": "dog",
        "B": "chicken",
        "C": "bacon"
      },
      "correctAnswer": "dog"
    }


    let result = "";
    result += rawResponse.question;
    result += "\nA:" + rawResponse.choices.A
    result += "\nB:" + rawResponse.choices.B
    result += "\nC:" + rawResponse.choices.C
    return result
    // return rawResponses
    // console.log(Config.API_KEY)

    // const prompt = `
    // This is a question: What does ${front} mean?
    // This is the correct answer: ${back}
    // Given this information, generate two wrong but misleading answers to the 
    // question. Put the correct answer in one of the 
    // multiple choices as well. Please output your answer in the following schema: 
    // {
    //   "question": "originalQuestion",
    //   "choices: {
    //     "A": "option",
    //     "B": "option",
    //     "C": "option"
    //   },
    //   correctAnswer: "letter"
    // }`

    // const resultResponse = await model.generateContent(prompt);
    // const response = resultResponse.response;
    // const rawResponse = JSON.parse(response.text());


    // let result = "";
    // result += rawResponse.question;
    // result += "\nA:" + rawResponse.choices.A
    // result += "\nB:" + rawResponse.choices.B
    // result += "\nC:" + rawResponse.choices.C
    // return result

  }
  return (
    <View style={{ width: screenWidth, justifyContent: "center", alignItems: "center" }}>
      <Animated.View style={[styles.front, frontAnimatedStyle]}>
        <Pressable onPress={handlePress} style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
          {
            score == 0 ? <Text style={styles.cardText}>{front}</Text> :
              <Text style={styles.backText}>{getMultipleChoiceQuestion()}</Text>
          }

        </Pressable>
      </Animated.View>
      <Animated.View style={[styles.back, backAnimatedStyle]}>
        <Pressable onPress={handlePress} style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
          <Text style={styles.backText}>{back}</Text>
        </Pressable>
      </Animated.View>
      <Image source={require("./graph.png")} style={styles.graph}></Image>

      {!frontFacing && (
        <>
          <Pressable style={styles.correctBtn} onPress={() => {
            correct();
          }}>
            <Image source={require("./checkmark.png")}></Image>
          </Pressable>
          <Pressable style={styles.wrongBtn} onPress={() => {
            // if (score > 0) {

            // }
          }}>
            <Image source={require("./wrong.png")}></Image>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  graph: {
    position: "relative",
    top: 30
  },
  correctBtn: {
    position: "absolute",
    bottom: 30,
    left: 140
  },
  wrongBtn: {
    position: "absolute",
    bottom: 30,
    right: 140
  },
  cardText: {
    fontSize: 70
  },
  backText: {
    fontSize: 30
  },
  title: {
    fontSize: 50,
    position: "absolute",
    top: 125,
  },
  debugButton: {
    backgroundColor: "#FFCC32",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginBottom: 20,
    width: "90%"
  },
  front: {
    height: 250,
    width: 350,
    backgroundColor: "#FFFCF7",
    borderRadius: 16,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    width: "75%",
    height: "60%",
  },
  back: {
    height: 250,
    width: 350,
    backgroundColor: "#FFFCF7",
    borderRadius: 16,
    backfaceVisibility: "hidden",
    alignItems: "center",
    justifyContent: "center",
    width: "75%",
    height: "60%",
  },
});
