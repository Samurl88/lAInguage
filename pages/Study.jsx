import { View, Text, SafeAreaView, Pressable, StyleSheet, FlatList, Dimensions, Image, TextInput, ActivityIndicator, Button } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Animated, { useSharedValue, interpolate, useAnimatedStyle, withTiming, withRepeat, Easing, interpolateColor, FadeInDown, FadeInUp, FadeIn, LightSpeedInLeft, LightSpeedInRight, SlideInRight, ZoomIn, FadeInRight, FadeOut, withSpring, withDelay, withSequence } from 'react-native-reanimated';
import Config from "react-native-config"
import auth from '@react-native-firebase/auth';
import database from "@react-native-firebase/database";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg"
import { SFSymbol } from 'react-native-sfsymbols';
import { LinearGradient as LinearGradientRN } from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import notifee, { RepeatFrequency, TimestampTrigger, TriggerType } from '@notifee/react-native';

const dayjs = require('dayjs')

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;


// Initializing model
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

export default function StudyPage({ language, stars, translations, termsPerSession }) {

  const [flashcards, setFlashcards] = useState(null);
  const [MCQs, setMCQs] = useState(null)
  const [numAnswered, setNumAnswered] = useState(0)
  const [complete, setComplete] = useState(null)
  const [loading, setLoading] = useState(true)

  const [selectedTerms, setSelectedTerms] = useState(null)

  // Loading animation
  const rotate = useSharedValue("0deg")
  useEffect(() => {
    if (!flashcards || !MCQs)
      rotate.value = withRepeat(withTiming("360deg", { duration: 1000, }), -1)
    else {
      rotate.value = "0deg"
    }
  }, [flashcards, MCQs])


  // Handle backend completion + notifications
  const onComplete = async () => {
    let uid = auth().currentUser.uid;
    setComplete(true);

    database()
      .ref(`${uid}/profile`)
      .update({
        stars: stars + 1,
        lastCompleted: JSON.stringify(dayjs())
      })

    // If it's not 12 yet, then cancel notification for the day
    let hour = dayjs().hour()
    // console.log(hour)
    if (hour < 12) {
      const reminderId = dayjs().format('ddd');
      console.log(reminderId)
      notifee.cancelTriggerNotification(reminderId)
    }
  }

  // Creating question flatlist
  const ref = useRef();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const goNextSlide = (delay = true) => {
    setTimeout(() => {
      setNumAnswered(numAnswered + 1);
      const nextSlideIndex = currentSlideIndex + 1;
      const offset = nextSlideIndex * screenWidth;
      ref?.current?.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
      if (nextSlideIndex == flashcards.length) {
        onComplete();
      }
    }, delay ? 1000 : 0);
  }
  const updateCurrentSlideIndex = e => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / screenWidth);
    setCurrentSlideIndex(currentIndex)
  }

  // Generating all MCQs
  async function createMCQs(mcqs) {
    const words = mcqs.map(item => item.front);
    const prompt = `
    Words: ${words}
    Question: "What does (word) mean?"
    Given this information, generate two wrong but misleading answers to the 
    question. Put the correct answer in one of the multiple choices as well. Each answer must be 10 words or less
    Please output your answer in the following schema, continuing until all words have been included:
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
    if (words.length) {
      const resultResponse = await model.generateContent(prompt);
      const response = resultResponse.response;
      const mcqJSON = JSON.parse(response.text());
      setMCQs(mcqJSON)
      console.log(mcqJSON)
    } else {
      setMCQs([])
      console.log("No MCQs!")
    }
  }

  // Sorts terms into flashcard, MCQ, and FRQ
  function sortTerms() {
    let uid = auth().currentUser.uid;
    database()
      .ref(`${uid}/words`)
      .once('value')
      .then(snapshot => {
        let words = snapshot.val();

        if (words === null) {
          setSelectedTerms([]);
          return
        }

        // Get 10 random words, removing words w/ score of 3 (mastered)
        let terms = Object.keys(words).filter(word => words[word].score !== 3);
        const shuffled = terms.sort(() => 0.5 - Math.random());
        let selectedTerms = shuffled.slice(0, termsPerSession);
        setSelectedTerms(selectedTerms);


        let flashcards = [];
        let mcqs = []

        for (const term of selectedTerms) {
          let score = words[term]["score"]
          let card = { front: term, back: `${words[term]["translatedWord"]} · ${words[term]["translatedDefinition"]}`, frontFacing: true, score: words[term]["score"] };
          if (score == 2) {
            card.type = "frq"
          } else if (score == 1) {
            card.type = "mcq"
            mcqs.push(card)
          } else if (score == 0) {
            card.type = "flashcard"
          }
          flashcards.push(card)
        }

        // order terms -> flashcards, mcqs, frqs (by score)
        const sortedFlashcards = flashcards.sort((a, b) => {
          let x = a.score;
          let y = b.score;

          if (x > y) return 1
          if (y > x) return -1
          return 0
        })

        createMCQs(mcqs);
        setFlashcards(sortedFlashcards);
      });
  }

  // Begin when user enters page
  useEffect(() => {
    if (termsPerSession) {
      reset();
    }
  }, [termsPerSession]);



  // Resets all values
  function reset() {
    setLoading(true)
    setFlashcards(null);
    setMCQs(null);
    setNumAnswered(0);
    setComplete(null);
    setCurrentSlideIndex(0)
    
    currentProgressCoverWidth.value = screenWidth * 0.7
    sortTerms();
  }

  // Increment progress bar when user answers questions
  const currentProgressCoverWidth = useSharedValue(screenWidth * 0.7)
  useEffect(() => {
    if (flashcards && numAnswered) {
      if (numAnswered >= flashcards.length) {
        // Reset progress bar
        currentProgressCoverWidth.value = withSequence(withTiming(currentProgressCoverWidth.value - ((1 / flashcards.length) * screenWidth * 0.7), { duration: 750 }), withDelay(250, withTiming(screenWidth * 0.7, { duration: 2000 })))
      }
      else {
        currentProgressCoverWidth.value = withTiming(currentProgressCoverWidth.value - ((1 / flashcards.length) * screenWidth * 0.7), { duration: 750 })
      }
    }
  }, [numAnswered])





  if (selectedTerms?.length == 0) {
    return (
      <SafeAreaView style={{ justifyContent: "center", alignItems: "center", backgroundColor: "#F5EEE5", height: screenHeight }}>
        <View style={styles.container}>
          <Text style={styles.title}>{translations.practice[language]}</Text>
          <View style={{ width: screenWidth, justifyContent: "center", alignItems: "center" }}>
            <View style={styles.back}>
              <Text style={{ paddingTop: 20, fontSize: 20, fontFamily: "NewYorkLarge-Regular", color: "gray", textAlign: "center" }}>{translations.scan_a_term_to_get_started[language]}</Text>
            </View>
          </View>
        </View>
        <ProgressBar />

      </SafeAreaView>
    )
  }

  // Renders questions (if terms are done sorting and MCQs have been generated)
  if (flashcards && MCQs)
    return (
      <>
        <SafeAreaView style={{ justifyContent: "center", alignItems: "center", backgroundColor: "#F5EEE5", height: screenHeight }}>
          {complete
            ? <Animated.View entering={FadeIn.duration(500)} exiting={FadeOut.duration(500)} style={{ position: "absolute", height: screenHeight, width: screenWidth, top: 0, zIndex: 0 }}>
              <LinearGradientRN useAngle={true} angle={135} angleCenter={{ x: 0.5, y: 0.5 }} locations={[0.3, 0.85, 1]} colors={['rgba(255, 255, 255, 0)', '#54B4EE', '#FD8DFF']} style={{ height: screenHeight, width: screenWidth, }} />
            </Animated.View>
            : null
          }
          <View style={styles.container}>
            <Text style={styles.title}>{translations.practice[language]}</Text>
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
                  language={language}
                  translations={translations}
                />
              )}
              pagingEnabled
              onMomentumScrollEnd={updateCurrentSlideIndex}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.front}
              style={{ zIndex: 100 }}
              scrollEnabled={false}

              ListFooterComponent={<FooterFlashcard reset={reset} language={language} translations={translations} />}
            />
          </View>
          <ProgressBar flashcards={flashcards} numAnswered={numAnswered} currentProgressCoverWidth={currentProgressCoverWidth} />
        </SafeAreaView >
      </>
    );


  function ProgressBar({ flashcards, numAnswered, currentProgressCoverWidth, coverWidth }) {
    const progressBarWidth = screenWidth * 0.7

    // Progress bar animation 
    if (flashcards) {
      // portion progress bar
      let numTerms = flashcards.length;

      let numFlashcard = 0
      let numMCQ = 0
      let numFRQ = 0
      flashcards.forEach((flashcard) => {
        if (flashcard.type == "flashcard")
          numFlashcard++;
        else if (flashcard.type == "mcq")
          numMCQ++;
        else
          numFRQ++;
      });
      const flashcardProgressWidth = (numFlashcard / numTerms) * progressBarWidth - 6;
      const mcqProgressWidth = (numMCQ / numTerms) * progressBarWidth - 5;
      const frqProgressWidth = (numFRQ / numTerms) * progressBarWidth - 5;

      return (
        <View style={{ position: "absolute", top: screenHeight * 0.89, flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "center" }}>
          <MaskedView
            style={{ borderRadius: 10 }}
            maskElement={
              <View style={{
                backgroundColor: 'transparent',
                width: progressBarWidth,
                height: 12,
                borderRadius: 10,
                flexDirection: "row",
                gap: 5,
                justifyContent: "center"
              }}>
                <View style={{ width: flashcardProgressWidth, height: 12, backgroundColor: "black", borderRadius: 10 }}></View>
                <View style={{ width: mcqProgressWidth, height: 12, backgroundColor: "black", borderRadius: 10 }}></View>
                <View style={{ width: frqProgressWidth, height: 12, backgroundColor: "black", borderRadius: 10 }}></View>
              </View>
            }
          >
            <Animated.View style={{ backgroundColor: numAnswered >= flashcards?.length ? "#F5EEE5" : "#D4CBC3", width: currentProgressCoverWidth, height: 12, position: "absolute", zIndex: 30, alignSelf: "flex-end" }} />
            <LinearGradientRN colors={['#779DE9', '#e6c5ff', '#779de9']} style={{ width: progressBarWidth, height: 12, borderRadius: 10 }} start={{ x: 0, y: 1 }} end={{ x: 1, y: 1 }} />
          </MaskedView>

          {numAnswered >= flashcards.length
            ? <View style={{ width: 20, height: 20 }}>
              <Animated.View entering={FadeIn}>
                <Svg
                  style={{ left: 5 }}
                  stroke={"#82c5ed"}
                  width={20}
                  height={20}
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <Path
                    d="M8.5 17a.694.694 0 01-.485-.188.81.81 0 01-.247-.477 33.306 33.306 0 00-.435-2.447c-.147-.688-.33-1.27-.545-1.748a3.85 3.85 0 00-.792-1.202 3.677 3.677 0 00-1.192-.793c-.477-.204-1.054-.375-1.73-.511a33.305 33.305 0 00-2.384-.4.793.793 0 01-.503-.24A.706.706 0 010 8.5a.69.69 0 01.196-.494.824.824 0 01.494-.248c1.107-.12 2.038-.261 2.793-.426.756-.17 1.377-.404 1.866-.7A3.45 3.45 0 006.54 5.449c.301-.5.542-1.14.724-1.918.182-.78.35-1.737.503-2.874A.81.81 0 018.015.18.713.713 0 018.5 0a.67.67 0 01.468.179c.137.12.222.279.256.477.159 1.137.33 2.095.511 2.874.187.773.431 1.41.732 1.91.301.494.696.889 1.184 1.184.489.296 1.11.529 1.866.7.755.164 1.686.31 2.793.434.193.029.355.111.486.248A.674.674 0 0117 8.5a.674.674 0 01-.204.494.785.785 0 01-.494.24 26.945 26.945 0 00-2.794.443c-.755.164-1.38.395-1.874.69a3.451 3.451 0 00-1.184 1.194c-.295.494-.536 1.13-.724 1.91a30.81 30.81 0 00-.502 2.864.752.752 0 01-.247.477A.664.664 0 018.5 17z"
                    fill="#2F2C2A"
                  />
                </Svg>
              </Animated.View>
              <Animated.View entering={FadeIn.delay(250)}>
                <Svg
                  style={{ bottom: 5, position: "absolute", }}
                  stroke={"#82c5ed"}
                  width={20}
                  height={20}
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <Path
                    d="M8.5 17a.694.694 0 01-.485-.188.81.81 0 01-.247-.477 33.306 33.306 0 00-.435-2.447c-.147-.688-.33-1.27-.545-1.748a3.85 3.85 0 00-.792-1.202 3.677 3.677 0 00-1.192-.793c-.477-.204-1.054-.375-1.73-.511a33.305 33.305 0 00-2.384-.4.793.793 0 01-.503-.24A.706.706 0 010 8.5a.69.69 0 01.196-.494.824.824 0 01.494-.248c1.107-.12 2.038-.261 2.793-.426.756-.17 1.377-.404 1.866-.7A3.45 3.45 0 006.54 5.449c.301-.5.542-1.14.724-1.918.182-.78.35-1.737.503-2.874A.81.81 0 018.015.18.713.713 0 018.5 0a.67.67 0 01.468.179c.137.12.222.279.256.477.159 1.137.33 2.095.511 2.874.187.773.431 1.41.732 1.91.301.494.696.889 1.184 1.184.489.296 1.11.529 1.866.7.755.164 1.686.31 2.793.434.193.029.355.111.486.248A.674.674 0 0117 8.5a.674.674 0 01-.204.494.785.785 0 01-.494.24 26.945 26.945 0 00-2.794.443c-.755.164-1.38.395-1.874.69a3.451 3.451 0 00-1.184 1.194c-.295.494-.536 1.13-.724 1.91a30.81 30.81 0 00-.502 2.864.752.752 0 01-.247.477A.664.664 0 018.5 17z"
                    fill="#2F2C2A"
                  />
                </Svg>
              </Animated.View>
            </View>
            : <Svg
              width={20}
              height={20}
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <Path
                d="M8.5 17a.694.694 0 01-.485-.188.81.81 0 01-.247-.477 33.306 33.306 0 00-.435-2.447c-.147-.688-.33-1.27-.545-1.748a3.85 3.85 0 00-.792-1.202 3.677 3.677 0 00-1.192-.793c-.477-.204-1.054-.375-1.73-.511a33.305 33.305 0 00-2.384-.4.793.793 0 01-.503-.24A.706.706 0 010 8.5a.69.69 0 01.196-.494.824.824 0 01.494-.248c1.107-.12 2.038-.261 2.793-.426.756-.17 1.377-.404 1.866-.7A3.45 3.45 0 006.54 5.449c.301-.5.542-1.14.724-1.918.182-.78.35-1.737.503-2.874A.81.81 0 018.015.18.713.713 0 018.5 0a.67.67 0 01.468.179c.137.12.222.279.256.477.159 1.137.33 2.095.511 2.874.187.773.431 1.41.732 1.91.301.494.696.889 1.184 1.184.489.296 1.11.529 1.866.7.755.164 1.686.31 2.793.434.193.029.355.111.486.248A.674.674 0 0117 8.5a.674.674 0 01-.204.494.785.785 0 01-.494.24 26.945 26.945 0 00-2.794.443c-.755.164-1.38.395-1.874.69a3.451 3.451 0 00-1.184 1.194c-.295.494-.536 1.13-.724 1.91a30.81 30.81 0 00-.502 2.864.752.752 0 01-.247.477A.664.664 0 018.5 17z"
                fill="url(#paint0_linear_49_1672)"
              />
              <Path
                d="M8.5 17a.694.694 0 01-.485-.188.81.81 0 01-.247-.477 33.306 33.306 0 00-.435-2.447c-.147-.688-.33-1.27-.545-1.748a3.85 3.85 0 00-.792-1.202 3.677 3.677 0 00-1.192-.793c-.477-.204-1.054-.375-1.73-.511a33.305 33.305 0 00-2.384-.4.793.793 0 01-.503-.24A.706.706 0 010 8.5a.69.69 0 01.196-.494.824.824 0 01.494-.248c1.107-.12 2.038-.261 2.793-.426.756-.17 1.377-.404 1.866-.7A3.45 3.45 0 006.54 5.449c.301-.5.542-1.14.724-1.918.182-.78.35-1.737.503-2.874A.81.81 0 018.015.18.713.713 0 018.5 0a.67.67 0 01.468.179c.137.12.222.279.256.477.159 1.137.33 2.095.511 2.874.187.773.431 1.41.732 1.91.301.494.696.889 1.184 1.184.489.296 1.11.529 1.866.7.755.164 1.686.31 2.793.434.193.029.355.111.486.248A.674.674 0 0117 8.5a.674.674 0 01-.204.494.785.785 0 01-.494.24 26.945 26.945 0 00-2.794.443c-.755.164-1.38.395-1.874.69a3.451 3.451 0 00-1.184 1.194c-.295.494-.536 1.13-.724 1.91a30.81 30.81 0 00-.502 2.864.752.752 0 01-.247.477A.664.664 0 018.5 17z"
              />
              <Defs>
                <LinearGradient
                  id="paint0_linear_49_1672"
                  x1={2}
                  y1={2.5}
                  x2={15}
                  y2={16}
                  gradientUnits="userSpaceOnUse"
                >
                  <Stop stopColor="#65BAEE" />
                  <Stop offset={1} stopColor="#FD8DFF" />
                </LinearGradient>
              </Defs>
            </Svg>
          }

        </View>
      )
    } else {
      return (
        <View style={{ position: "absolute", top: screenHeight * 0.89, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Animated.View exiting={FadeOut} style={{ width: progressBarWidth, height: 12, backgroundColor: "#D4CBC3", borderRadius: 10, }} />
          <Svg
            width={20}
            height={20}
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <Path
              d="M8.5 17a.694.694 0 01-.485-.188.81.81 0 01-.247-.477 33.306 33.306 0 00-.435-2.447c-.147-.688-.33-1.27-.545-1.748a3.85 3.85 0 00-.792-1.202 3.677 3.677 0 00-1.192-.793c-.477-.204-1.054-.375-1.73-.511a33.305 33.305 0 00-2.384-.4.793.793 0 01-.503-.24A.706.706 0 010 8.5a.69.69 0 01.196-.494.824.824 0 01.494-.248c1.107-.12 2.038-.261 2.793-.426.756-.17 1.377-.404 1.866-.7A3.45 3.45 0 006.54 5.449c.301-.5.542-1.14.724-1.918.182-.78.35-1.737.503-2.874A.81.81 0 018.015.18.713.713 0 018.5 0a.67.67 0 01.468.179c.137.12.222.279.256.477.159 1.137.33 2.095.511 2.874.187.773.431 1.41.732 1.91.301.494.696.889 1.184 1.184.489.296 1.11.529 1.866.7.755.164 1.686.31 2.793.434.193.029.355.111.486.248A.674.674 0 0117 8.5a.674.674 0 01-.204.494.785.785 0 01-.494.24 26.945 26.945 0 00-2.794.443c-.755.164-1.38.395-1.874.69a3.451 3.451 0 00-1.184 1.194c-.295.494-.536 1.13-.724 1.91a30.81 30.81 0 00-.502 2.864.752.752 0 01-.247.477A.664.664 0 018.5 17z"
              fill="url(#paint0_linear_49_1672)"
            />
            <Path
              d="M8.5 17a.694.694 0 01-.485-.188.81.81 0 01-.247-.477 33.306 33.306 0 00-.435-2.447c-.147-.688-.33-1.27-.545-1.748a3.85 3.85 0 00-.792-1.202 3.677 3.677 0 00-1.192-.793c-.477-.204-1.054-.375-1.73-.511a33.305 33.305 0 00-2.384-.4.793.793 0 01-.503-.24A.706.706 0 010 8.5a.69.69 0 01.196-.494.824.824 0 01.494-.248c1.107-.12 2.038-.261 2.793-.426.756-.17 1.377-.404 1.866-.7A3.45 3.45 0 006.54 5.449c.301-.5.542-1.14.724-1.918.182-.78.35-1.737.503-2.874A.81.81 0 018.015.18.713.713 0 018.5 0a.67.67 0 01.468.179c.137.12.222.279.256.477.159 1.137.33 2.095.511 2.874.187.773.431 1.41.732 1.91.301.494.696.889 1.184 1.184.489.296 1.11.529 1.866.7.755.164 1.686.31 2.793.434.193.029.355.111.486.248A.674.674 0 0117 8.5a.674.674 0 01-.204.494.785.785 0 01-.494.24 26.945 26.945 0 00-2.794.443c-.755.164-1.38.395-1.874.69a3.451 3.451 0 00-1.184 1.194c-.295.494-.536 1.13-.724 1.91a30.81 30.81 0 00-.502 2.864.752.752 0 01-.247.477A.664.664 0 018.5 17z"
            />
            <Defs>
              <LinearGradient
                id="paint0_linear_49_1672"
                x1={2}
                y1={2.5}
                x2={15}
                y2={16}
                gradientUnits="userSpaceOnUse"
              >
                <Stop stopColor="#65BAEE" />
                <Stop offset={1} stopColor="#FD8DFF" />
              </LinearGradient>
            </Defs>
          </Svg>
        </View>
      )
    }

  }

  // loading
  return (
    <>
      <SafeAreaView style={{ justifyContent: "center", alignItems: "center", backgroundColor: "#F5EEE5", height: screenHeight }}>
        <View style={styles.container}>
          <Text style={styles.title}>{translations.practice[language]}</Text>
          <View style={{ width: screenWidth, justifyContent: "center", alignItems: "center" }}>
            <View style={styles.back}>
              <Animated.View style={{ transform: [{ rotate: rotate }] }}>
                <Svg
                  width={50}
                  height={50}
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <Path
                    d="M8.5 17a.694.694 0 01-.485-.188.81.81 0 01-.247-.477 33.306 33.306 0 00-.435-2.447c-.147-.688-.33-1.27-.545-1.748a3.85 3.85 0 00-.792-1.202 3.677 3.677 0 00-1.192-.793c-.477-.204-1.054-.375-1.73-.511a33.305 33.305 0 00-2.384-.4.793.793 0 01-.503-.24A.706.706 0 010 8.5a.69.69 0 01.196-.494.824.824 0 01.494-.248c1.107-.12 2.038-.261 2.793-.426.756-.17 1.377-.404 1.866-.7A3.45 3.45 0 006.54 5.449c.301-.5.542-1.14.724-1.918.182-.78.35-1.737.503-2.874A.81.81 0 018.015.18.713.713 0 018.5 0a.67.67 0 01.468.179c.137.12.222.279.256.477.159 1.137.33 2.095.511 2.874.187.773.431 1.41.732 1.91.301.494.696.889 1.184 1.184.489.296 1.11.529 1.866.7.755.164 1.686.31 2.793.434.193.029.355.111.486.248A.674.674 0 0117 8.5a.674.674 0 01-.204.494.785.785 0 01-.494.24 26.945 26.945 0 00-2.794.443c-.755.164-1.38.395-1.874.69a3.451 3.451 0 00-1.184 1.194c-.295.494-.536 1.13-.724 1.91a30.81 30.81 0 00-.502 2.864.752.752 0 01-.247.477A.664.664 0 018.5 17z"
                    fill="url(#paint0_linear_49_1672)"
                  />
                  <Path
                    d="M8.5 17a.694.694 0 01-.485-.188.81.81 0 01-.247-.477 33.306 33.306 0 00-.435-2.447c-.147-.688-.33-1.27-.545-1.748a3.85 3.85 0 00-.792-1.202 3.677 3.677 0 00-1.192-.793c-.477-.204-1.054-.375-1.73-.511a33.305 33.305 0 00-2.384-.4.793.793 0 01-.503-.24A.706.706 0 010 8.5a.69.69 0 01.196-.494.824.824 0 01.494-.248c1.107-.12 2.038-.261 2.793-.426.756-.17 1.377-.404 1.866-.7A3.45 3.45 0 006.54 5.449c.301-.5.542-1.14.724-1.918.182-.78.35-1.737.503-2.874A.81.81 0 018.015.18.713.713 0 018.5 0a.67.67 0 01.468.179c.137.12.222.279.256.477.159 1.137.33 2.095.511 2.874.187.773.431 1.41.732 1.91.301.494.696.889 1.184 1.184.489.296 1.11.529 1.866.7.755.164 1.686.31 2.793.434.193.029.355.111.486.248A.674.674 0 0117 8.5a.674.674 0 01-.204.494.785.785 0 01-.494.24 26.945 26.945 0 00-2.794.443c-.755.164-1.38.395-1.874.69a3.451 3.451 0 00-1.184 1.194c-.295.494-.536 1.13-.724 1.91a30.81 30.81 0 00-.502 2.864.752.752 0 01-.247.477A.664.664 0 018.5 17z"
                  />
                  <Defs>
                    <LinearGradient
                      id="paint0_linear_49_1672"
                      x1={2}
                      y1={2.5}
                      x2={15}
                      y2={16}
                      gradientUnits="userSpaceOnUse"
                    >
                      <Stop stopColor="#65BAEE" />
                      <Stop offset={1} stopColor="#FD8DFF" />
                    </LinearGradient>
                  </Defs>
                </Svg>
              </Animated.View>
              <Text style={{ paddingTop: 20, fontSize: 20, fontFamily: "NewYorkLarge-Regular", color: "gray" }}>{translations.preparing_your_session[language]}...</Text>
            </View>
          </View>
        </View>
        <ProgressBar />

      </SafeAreaView>
    </>
  )
}

function FooterFlashcard({ reset, language, translations }) {
  return (
    <View style={{ width: screenWidth, justifyContent: "center", alignItems: "center" }}>
      <View style={{ ...styles.back, gap: 20 }}>
        <View style={{ gap: 15, alignItems: "center", padding: 20 }}>
          <Text style={{ fontFamily: "NewYorkLarge-Regular", fontSize: 35, textAlign: "center", }}><Text style={{ fontFamily: "NewYorkLarge-Semibold" }}>{translations.great_work[language]}</Text></Text>
          <Text style={{ fontSize: 20, textAlign: "center", }}>{translations.thats_another_star_for_your_collection[language]}</Text>
        </View>
        <Pressable onPress={reset} style={{ ...styles.defaultBtn, backgroundColor: "#2F2C2A", padding: 10, borderRadius: 10, }}>
          <SFSymbol name="repeat" size={25} color="white" />
        </Pressable>
      </View>
    </View>
  )
}

function Flashcard({ mcqs, front, back, frontFacing, toggleFacing, score, type, goNextSlide, language, translations }) {
  const [answer, setAnswer] = useState(null)

  const [loading, setLoading] = useState(null);
  const [FRQcorrect, setFRQcorrect] = useState(null);
  const [FRQfeedback, setFRQfeedback] = useState(null);

  function addScore() {
    let uid = auth().currentUser.uid;
    database()
      .ref(`${uid}/words/${front}`)
      .update({ score: score + 1 })
      .catch(error => { console.log(error) })
  }

  function removeScore() {
    let uid = auth().currentUser.uid;
    database()
      .ref(`${uid}/words/${front}`)
      .update({ score: score - 1 >= 0 ? score - 1 : 0 })
      .catch(error => { console.log(error) })
  }

  // Animated styles for flashcard flip
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

  // Interpolate styles for button color changes
  const showAnswer = useSharedValue(0);
  const correctColor = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        showAnswer.value,
        [0, 1],
        ["#2F2C2A", "#9BDD48"]
      )
    }
  })
  const wrongColor = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        showAnswer.value,
        [0, 1],
        ["#2F2C2A", "#DD6348"]
      )
    }
  })

  const FRQrotate = useSharedValue("0deg")
  // const FRQopacity = useSharedValue(0)

  // For FRQ: evaluate sentence
  const evaluateFRQ = async () => {
    setLoading(true);
 
    FRQrotate.value = withRepeat(withTiming("360deg", { duration: 1000, }), -1)
    // FRQopacity.value = withTiming(1, {duration: 500})


    const prompt = `
    Evaluate whether the following sentence is grammatically correct in the language of the word "${front}". To be correct, the sentence must include the word "${front}" correctly. 
    
    Sentence: ${answer}

    Provide feedback if the sentence is not correct. This feedback must be a full sentence written in ${language} 15 words or less. It must explain what is wrong and what would be correct.
    If the word "${front}" is not used in the sentence, feedback should be "You didn't use "${front}" in the sentence!" (in the language of ${language})
    Answer in the following schema:
    {
      correct: boolean,
      feedback: string or null
    }
    `

    const resultResponse = await model.generateContent(prompt);
    const response = resultResponse.response;
    const resultFRQ = JSON.parse(response.text());

    setFRQcorrect(resultFRQ.correct);
    setFRQfeedback(resultFRQ.feedback);
    showAnswer.value = withTiming(1, { duration: 250 });
    console.log(resultFRQ)
    if (resultFRQ.correct) {
      addScore()
      goNextSlide()
    } else {
      removeScore()
    }
    setLoading(false);
    FRQrotate.value = "0deg"
    // FRQopacity.value = 0
  }


  return (
    <View style={{ width: screenWidth, justifyContent: "center", alignItems: "center" }}>
      {type == "flashcard"
        && <>
          <Animated.View style={[styles.front, frontAnimatedStyle]}>
            <Text style={{ fontFamily: "SFPro-Semibold", fontSize: 17, position: "absolute", top: screenHeight * 0.03, }}>{translations.quiz_yourself[language]}</Text>
            <Pressable style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
              {
                <Text style={styles.bigCardText}>{front}</Text>
              }
            </Pressable>
          </Animated.View>
          <Animated.View style={[styles.back, backAnimatedStyle]}>
            <Pressable style={{ width: "85%", height: "100%", alignItems: "center", justifyContent: "center" }}>
              <Text style={styles.smallCardText}>{back}</Text>
            </Pressable>
          </Animated.View>
        </>
      }
      {type == "mcq"
        && <>
          <View style={styles.back}>
            <Pressable style={{ width: "100%", height: "100%", alignItems: "center", padding: 20 }}>
              <Text style={{ fontFamily: "SFPro-Semibold", fontSize: 17, position: "absolute", top: screenHeight * 0.03 }}>{translations.choose_the_best_answer[language]}</Text>
              <Text style={{ fontFamily: "NewYorkLarge-Regular", fontSize: 25, textAlign: "center", position: "absolute", top: screenHeight * 0.1 }}>{translations.what_is_the_meaning_of[language]}<Text style={{ fontFamily: "NewYorkLarge-Semibold" }}> {front}</Text>?</Text>
              <View style={{ position: "absolute", top: screenHeight * 0.2, gap: 20, width: "95%", }}>
                <View style={{ flexDirection: "row", gap: 10, alignItems: "center", width: "85%", }}>
                  <View style={{ backgroundColor: "#E8E1DB", height: 30, width: 30, justifyContent: "center", alignItems: "center", borderRadius: 10, }}>
                    <Text style={{ color: "#817E80", fontSize: 15, fontFamily: "SFPro-Semibold" }}>A</Text>
                  </View>
                  <Text style={{ ...styles.smallCardText, textAlign: 'left' }}>
                    {mcqs[front]?.choices?.A}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 10, alignItems: "center", width: "85%", }}>
                  <View style={{ backgroundColor: "#E8E1DB", height: 30, width: 30, justifyContent: "center", alignItems: "center", borderRadius: 10 }}>
                    <Text style={{ color: "#817E80", fontSize: 15, fontFamily: "SFPro-Semibold" }}>B</Text>
                  </View>
                  <Text style={{ ...styles.smallCardText, textAlign: 'left' }}>
                    {mcqs[front]?.choices?.B}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 10, alignItems: "center", width: "85%", }}>
                  <View style={{ backgroundColor: "#E8E1DB", height: 30, width: 30, justifyContent: "center", alignItems: "center", borderRadius: 10 }}>
                    <Text style={{ color: "#817E80", fontSize: 15, fontFamily: "SFPro-Semibold" }}>C</Text>
                  </View>
                  <Text style={{ ...styles.smallCardText, textAlign: 'left' }}>
                    {mcqs[front]?.choices?.C}
                  </Text>
                </View>
                {/* <Text style={styles.smallCardText}><Text style={{ fontFamily: "NewYorkLarge-Semibold" }}>B.</Text> {mcqs[front].choices.B}</Text>
                <Text style={styles.smallCardText}><Text style={{ fontFamily: "NewYorkLarge-Semibold" }}>C.</Text> {mcqs[front].choices.C}</Text> */}
              </View>
            </Pressable>
          </View>
        </>
      }
      {type == "frq"
        && <>
          <View style={styles.back}>
            <Pressable style={{ width: "100%", height: "100%", alignItems: "center", padding: 20 }}>
              <Text style={{ fontFamily: "SFPro-Semibold", fontSize: 17, position: "absolute", top: screenHeight * 0.03, textAlign: "center", }}>{translations.write_a_sentence_with_the_following_word[language]}</Text>
              <Text style={{ fontFamily: "NewYorkLarge-Regular", fontSize: 25, textAlign: "center", position: "absolute", top: screenHeight * 0.13 }}><Text style={{ fontFamily: "NewYorkLarge-Semibold" }}>{front}</Text></Text>

              <TextInput style={{ position: "absolute", top: screenHeight * 0.2, alignItems: "center", fontSize: 18, flex: 1, height: screenHeight * 0.18, width: "100%" }} placeholder={translations.start_typing[language] + "..."} editable={FRQcorrect === null ? true : false} multiline blurOnSubmit value={answer} onChangeText={setAnswer} />
              <Text style={{ position: "absolute", bottom: screenHeight * 0.03, alignItems: "center", fontSize: 18, textAlign: "center", color: "#DD6348" }}>{FRQfeedback}</Text>
            </Pressable>
          </View>
        </>
      }

      {/* Bottom buttons */}
      {type == "flashcard" ?
        !frontFacing
          ? <View style={styles.btnContainer}>
            <Animated.View style={[styles.defaultBtn, answer === false ? wrongColor : { backgroundColor: "#2F2C2A" }]}>
              <Pressable style={{ ...styles.defaultBtn }} onPress={() => {
                if (!answer) {
                  setAnswer(false)
                  showAnswer.value = withTiming(1, { duration: 250 });
                  goNextSlide()
                }
              }}>
                <SFSymbol name="xmark" size={25} color="white" />
              </Pressable>
            </Animated.View>

            <Animated.View style={[styles.defaultBtn, answer === true ? correctColor : { backgroundColor: "#2F2C2A" }]}>
              <Pressable style={{ ...styles.defaultBtn }} onPress={() => {
                if (!answer) {
                  setAnswer(true)
                  addScore()
                  showAnswer.value = withTiming(1, { duration: 250 });
                  goNextSlide()
                }
              }}>
                <SFSymbol name="checkmark" size={25} color="white" />
              </Pressable>
            </Animated.View>
          </View>
          : <View style={styles.btnContainer}>
            <Animated.View style={[styles.defaultBtn, { backgroundColor: "#2F2C2A" }]}>
              <Pressable style={{ ...styles.defaultBtn }} onPress={() => {
                handlePress()
              }}>
                <SFSymbol name="arrow.triangle.2.circlepath" size={25} color="white" />
              </Pressable>
            </Animated.View>
          </View>
        : null
      }
      {
        type == "mcq" &&
        (
          <>
            <View style={styles.btnContainer}>
              {/* if correct answer, turn green. if selected and wrong answer, turn red. else, continue being black */}
              <Animated.View style={[styles.defaultBtn, mcqs[front]?.correctAnswer == "A" ? correctColor : answer === "A" ? wrongColor : { backgroundColor: "#2F2C2A" }]}>
                <Pressable style={{ ...styles.defaultBtn }} onPress={() => {
                  if (!answer) {
                    if (mcqs[front]?.correctAnswer == "A")
                      addScore()
                    else
                      removeScore();
                    setAnswer("A")
                    showAnswer.value = withTiming(1, { duration: 250 });
                    goNextSlide()
                  }
                }}>
                  <Text style={{ fontSize: 20, color: "#F0E8DD" }}>A</Text>
                </Pressable>
              </Animated.View>

              <Animated.View style={[styles.defaultBtn, mcqs[front]?.correctAnswer == "B" ? correctColor : answer === "B" ? wrongColor : { backgroundColor: "#2F2C2A" }]}>
                <Pressable style={{ ...styles.defaultBtn }} onPress={() => {
                  if (!answer) {
                    if (mcqs[front]?.correctAnswer == "B")
                      addScore()
                    else
                      removeScore();
                    setAnswer("B")
                    showAnswer.value = withTiming(1, { duration: 250 });
                    goNextSlide()
                  }
                }}>
                  <Text style={{ fontSize: 20, color: "#F0E8DD" }}>B</Text>
                </Pressable>
              </Animated.View>

              <Animated.View style={[styles.defaultBtn, mcqs[front]?.correctAnswer == "C" ? correctColor : answer === "C" ? wrongColor : { backgroundColor: "#2F2C2A" }]}>
                <Pressable style={{ ...styles.defaultBtn }} onPress={() => {
                  if (!answer) {
                    if (mcqs[front]?.correctAnswer == "C")
                      addScore()
                    else
                      removeScore();
                    setAnswer("C")
                    showAnswer.value = withTiming(1, { duration: 250 });
                    goNextSlide()
                  }
                }}>
                  <Text style={{ fontSize: 20, color: "#F0E8DD" }}>C</Text>
                </Pressable>
              </Animated.View>
            </View>
          </>
        )
      }
      {
        type == "frq" &&
        (
          <>
            <View style={styles.btnContainer}>
              <Animated.View style={[styles.defaultBtn, FRQcorrect == true ? correctColor : FRQcorrect === false ? wrongColor : { backgroundColor: answer ? "#2F2C2A" : "#A6A19D" }]}>
                <Pressable style={{ ...styles.defaultBtn }} onPress={() => {
                  if (FRQcorrect == false) {
                    goNextSlide(false)
                  } else if (answer) {
                    evaluateFRQ()
                  }
                }}>
                  {loading
                    ? <Animated.View style={{ transform: [{ rotate: FRQrotate }], opacity: 1 }}>
                    <SFSymbol name="sparkle" size={30} color="gray" />
                  </Animated.View>
                    : FRQcorrect
                      ? <SFSymbol name="checkmark" size={25} color="white" />
                      : FRQcorrect === false
                        // ? <SFSymbol name="xmark" size={25} color="white" />
                        ? <SFSymbol name="arrow.right" size={25} color="white" />
                        : <SFSymbol name="arrow.up" size={25} color="white" />
                  }
                </Pressable>
              </Animated.View>
            </View>
          </>
        )
      }

    </View>
  );
}


const styles = StyleSheet.create({
  btnContainer: {
    position: "absolute",
    top: screenHeight * 0.59,
    flexDirection: "row",
    gap: 20,
  },
  progressBar: {


  },
  defaultBtn: {
    // backgroundColor: "#2F2C2A",
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  correctBtn: {
    backgroundColor: "#9BDD48",
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  wrongBtn: {
    backgroundColor: "#DD6348",
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  bigCardText: {
    fontFamily: "NewYorkLarge-Regular",
    fontSize: 40,
    textAlign: "center"
  },
  smallCardText: {
    fontFamily: "NewYorkLarge-Regular",
    fontSize: 20,
    textAlign: "center"
  },
  title: {
    fontFamily: "NewYorkLarge-Semibold",
    fontSize: 34,
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
    backgroundColor: "#FFFCF7",
    borderRadius: 16,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    width: screenWidth * 0.8,
    height: screenHeight * 0.5,
    shadowOffset: 3,
    shadowRadius: 3,
    shadowColor: "black",
    shadowOpacity: 0.3,
    top: screenHeight * 0.04
  },
  back: {
    backgroundColor: "#FFFCF7",
    borderRadius: 16,
    backfaceVisibility: "hidden",
    alignItems: "center",
    justifyContent: "center",
    width: screenWidth * 0.8,
    height: screenHeight * 0.5,
    shadowOffset: 3,
    shadowRadius: 3,
    shadowColor: "black",
    shadowOpacity: 0.3,
    top: screenHeight * 0.04,
    position: "absolute"
  },
  container: {
    position: "absolute",
    top: screenHeight * 0.15,
    alignItems: "center",
    // backgroundColor: "red",
    height: "100%",
  },
  box: {
    height: 100,
    backgroundColor: '#b58df1',
    borderRadius: 20,
    marginVertical: 64,
  },
});
