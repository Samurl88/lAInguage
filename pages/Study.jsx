import { View, Text, SafeAreaView, Pressable, StyleSheet, FlatList, Dimensions, Image, TextInput } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Animated, { useSharedValue, interpolate, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Config from "react-native-config"
import auth from '@react-native-firebase/auth';
import database from "@react-native-firebase/database";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

export default function StudyPage({ navigation }) {
  const [flashcards, setFlashcards] = useState(null);
  const [MCQs, setMCQs] = useState(null)

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

  const goNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex != flashcards.length) {
      const offset = nextSlideIndex * screenWidth;
      ref?.current?.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    }
  }
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);


  const updateCurrentSlideIndex = e => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / screenWidth);
    setCurrentSlideIndex(currentIndex)
  }

  async function createMCQs(mcqs) {
    const words = mcqs.map(item => item.front);
    const prompt = `
    Words: ${words}
    Question: "What does (word) mean?"
    Given this information, generate two wrong but misleading answers to the 
    question. Put the correct answer in one of the multiple choices as well. Please output your answer in the following schema, continuing until all words have been included:
    { "(word1)": 
      {
        "question": "What does (word) mean?",
        "choices: {
          "A": "option",
          "B": "option",
          "C": "option"
        },
        correctAnswer: "letter",
      },
      "(word2)":
      {
        "question": "What does (word) mean?",
        "choices: {
          "A": "option",
          "B": "option",
          "C": "option"
        },
        correctAnswer: "letter",
      },
      ...
    }`
    console.log(Config.API_KEY)

    const resultResponse = await model.generateContent(prompt);
    const response = resultResponse.response;
    const mcqJSON = JSON.parse(response.text());
    setMCQs(mcqJSON)
    console.log(mcqJSON)
  }

  function sortTerms() {
    let uid = auth().currentUser.uid;
    database()
      .ref(`${uid}/words`)
      .once('value')
      .then(snapshot => {
        let words = snapshot.val();

        let flashcards = [];
        let mcqs = []

        for (const word in words) {
          let score = words[word]["score"]
          let card = { front: word, back: words[word]["translatedDefinition"], frontFacing: true, score: words[word]["score"] };
          if (score == 2) {
            card.type = "frq"
          } else if (score == 1) {
            card.type = "mcq"
            mcqs.push(card)
          } else {
            card.type = "flashcard"
          }
          flashcards.push(card)
        }
        createMCQs(mcqs);
        setFlashcards(flashcards);
      });
  }

  useEffect(() => {
    sortTerms();
  }, []);

  useEffect(() => {
    console.log(flashcards)
  }, [flashcards])

  const ref = useRef();



  if (flashcards && MCQs)
    return (
      <SafeAreaView style={{ justifyContent: "center", alignItems: "center", backgroundColor: "#F5EEE5", height: screenHeight }}>
        <Image source={{ uri: "https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Item_Primogem.png/revision/latest?cb=20201117071158" }} style={{ width: 35, height: 35, position: "absolute", top: 70, left: 30 }} />
        <Text style={{ position: "absolute", top: 75, fontSize: 22, left: 60 }}>4</Text>
        <Text style={styles.title}>Practice</Text>
        {/* <Pressable onPress={() => {
        auth.signOut();
      }}>
        <Image source={{ uri: "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png" }} style={{ width: 35, height: 35, position: "absolute", top: 70, right: 30 }} />
      </Pressable> */}

        <FlatList
          data={flashcards}
          ref={ref}
          horizontal
          renderItem={({ item, index }) => (
            <Flashcard
              mcqs={MCQs}
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
              type={item.type}
              goNextSlide={goNextSlide}
            />
          )}
          pagingEnabled
          onMomentumScrollEnd={updateCurrentSlideIndex}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.front}
          style={{ zIndex: 100 }}
          scrollEnabled={false}
        />

      </SafeAreaView>
    );
}


function Flashcard({ mcqs, front, back, frontFacing, toggleFacing, type, goNextSlide }) {
  // console.log(front)
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

  console.log(type)
  return (
    <View style={{ width: screenWidth, justifyContent: "center", alignItems: "center" }}>
      {type == "flashcard"
        && <>
          <Animated.View style={[styles.front, frontAnimatedStyle]}>
            <Pressable onPress={handlePress} style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
              {
                score == 0 ? <Text style={styles.cardText}>{front}</Text> :
                  <Text style={styles.backText}>{front}</Text>
              }
            </Pressable>
          </Animated.View>
          <Animated.View style={[styles.back, backAnimatedStyle]}>
            <Pressable onPress={handlePress} style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
              <Text style={styles.backText}>{back}</Text>
            </Pressable>
          </Animated.View>
        </>
      }
      {type == "mcq"
        && <>
          <View style={styles.back}>
            <Pressable onPress={handlePress} style={{ width: "100%", height: "100%", alignItems: "center", padding: 20 }}>
              <Text style={{ fontFamily: "SFPro-Semibold", fontSize: 20, position: "absolute", top: screenHeight * 0.03 }}>Choose the best answer:</Text>
              <Text style={{ fontFamily: "NewYorkLarge-Regular", fontSize: 25, textAlign: "center", position: "absolute", top: screenHeight * 0.1 }}>What does <Text style={{ fontFamily: "NewYorkLarge-Semibold" }}>{front}</Text> mean?</Text>
              <View style={{ position: "absolute", top: screenHeight * 0.2, alignItems: "center", gap: 20 }}>
                <Text style={{ fontFamily: "NewYorkLarge-Regular", fontSize: 20, textAlign: "center" }}><Text style={{ fontFamily: "NewYorkLarge-Semibold" }}>A.</Text> {mcqs[front].choices.A}</Text>
                <Text style={{ fontFamily: "NewYorkLarge-Regular", fontSize: 20, textAlign: "center" }}><Text style={{ fontFamily: "NewYorkLarge-Semibold" }}>B.</Text> {mcqs[front].choices.B}</Text>
                <Text style={{ fontFamily: "NewYorkLarge-Regular", fontSize: 20, textAlign: "center" }}><Text style={{ fontFamily: "NewYorkLarge-Semibold" }}>C.</Text> {mcqs[front].choices.C}</Text>
              </View>

              {/* <Text style={styles.backText}>{back}</Text> */}
            </Pressable>
          </View>
        </>
      }
      {type == "frq"
        && <>
          <View style={styles.back}>
            <Pressable onPress={handlePress} style={{ width: "100%", height: "100%", alignItems: "center", padding: 20 }}>
              <Text style={{ fontFamily: "SFPro-Semibold", fontSize: 20, position: "absolute", top: screenHeight * 0.03, textAlign: "center", }}>Write a sentence with the word:</Text>
              <Text style={{ fontFamily: "NewYorkLarge-Regular", fontSize: 25, textAlign: "center", position: "absolute", top: screenHeight * 0.13 }}><Text style={{ fontFamily: "NewYorkLarge-Semibold" }}>{front}</Text></Text>
              <TextInput style={{ position: "absolute", top: screenHeight * 0.2, alignItems: "center", gap: 20, width: "100%", fontSize: 18,}} placeholder="Start typing..." multiline blurOnSubmit />

              {/* <Text style={styles.backText}>{back}</Text> */}
            </Pressable>
          </View>
        </>
      }

      <Image source={require("./graph.png")} style={styles.graph}></Image>

      {!frontFacing &&
        type == "flashcard" &&
        (
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
      {
        type == "mcq" &&
        (
          <>
            <View style={{ position: "absolute", top: screenHeight * 0.8, flexDirection: "row", gap: 20 }}>
              <Pressable onPress={goNextSlide} style={{ width: 50, height: 50, backgroundColor: "#2F2C2A", borderRadius: 25, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 20, color: "#F0E8DD" }}>A</Text>
              </Pressable>
              <Pressable onPress={goNextSlide} style={{ width: 50, height: 50, backgroundColor: "#2F2C2A", borderRadius: 25, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 20, color: "#F0E8DD" }}>B</Text>
              </Pressable>
              <Pressable onPress={goNextSlide} style={{ width: 50, height: 50, backgroundColor: "#2F2C2A", borderRadius: 25, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 20, color: "#F0E8DD" }}>C</Text>
              </Pressable>
            </View>
          </>
        )
      }
      {
        type == "frq" &&
        (
          <>
            <View style={{ position: "absolute", top: screenHeight * 0.8, flexDirection: "row", gap: 20 }}>
              <Image source={require("./checkmark.png")}></Image>
            </View>
          </>
        )
      }

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
    fontFamily: "NewYorkLarge-Semibold",
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
