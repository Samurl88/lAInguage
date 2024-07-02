import { View, Text, SafeAreaView, StyleSheet, Button, Dimensions, Pressable, ActivityIndicator, FlatList } from 'react-native'
import { Configuration, PESDK, Tool } from "react-native-photoeditorsdk";
import { useCameraDevice, useCameraPermission, Camera } from 'react-native-vision-camera'
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useImage, Image } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import { Canvas, Path, useCanvasRef, Picture } from "@shopify/react-native-skia";
import { FadeIn, runOnJS } from 'react-native-reanimated';
import { SFSymbol } from 'react-native-sfsymbols';
import Config from 'react-native-config';
import Animated from 'react-native-reanimated';

import auth from '@react-native-firebase/auth';
import database from "@react-native-firebase/database"
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

import Svg, { Circle } from "react-native-svg"


const translations = {
  "dictionary": {
    "spanish": "diccionario",
    "chinese": "词典",
    "tagalog": "diksyunaryo",
    "vietnamese": "từ điển",
    "arabic": "قاموس",
    "french": "dictionnaire",
    "korean": "사전",
    "russian": "словарь",
    "portuguese": "dicionário",
    "hindi": "शब्दकोश"
  },
  "camera": {
    "spanish": "cámara",
    "chinese": "相机",
    "tagalog": "kamera",
    "vietnamese": "máy ảnh",
    "arabic": "كاميرا",
    "french": "caméra",
    "korean": "카메라",
    "russian": "камера",
    "portuguese": "câmera",
    "hindi": "कैमरा"
  },
  "highlight_text_to_translate_to_language": {
    "spanish": "Resalta los textos para traducir a español",
    "chinese": "突出显示文本以翻译为中文",
    "tagalog": "I-highlight ang mga teksto upang isalin sa Tagalog",
    "vietnamese": "Làm nổi bật các văn bản để dịch sang tiếng Việt",
    "arabic": "تمييز النصوص لترجمتها إلى العربية",
    "french": "Surlignez les textes à traduire en français",
    "korean": "한국어로 번역할 텍스트 강조",
    "russian": "Выделите тексты для перевода на русский",
    "portuguese": "Realce os textos para traduzir para português",
    "hindi": "पाठों को हिंदी में अनुवाद करने के लिए हाइलाइट करें"
  },
  "clear": {
    "spanish": "borrar",
    "chinese": "清除",
    "tagalog": "i-clear",
    "vietnamese": "xóa",
    "arabic": "مسح",
    "french": "effacer",
    "korean": "지우기",
    "russian": "очистить",
    "portuguese": "limpar",
    "hindi": "साफ़ करें"
  },
  "retake": {
    "spanish": "retomar",
    "chinese": "重拍",
    "tagalog": "muling kunin",
    "vietnamese": "chụp lại",
    "arabic": "إعادة",
    "french": "reprendre",
    "korean": "다시 찍기",
    "russian": "переснять",
    "portuguese": "repetir",
    "hindi": "फिर से लेना"
  },
  "done": {
    "spanish": "hecho",
    "chinese": "完成",
    "tagalog": "tapos na",
    "vietnamese": "xong",
    "arabic": "تم",
    "french": "terminé",
    "korean": "완료",
    "russian": "готово",
    "portuguese": "feito",
    "hindi": "हो गया"
  },
  "definitions": {
    "spanish": "definiciones",
    "chinese": "定义",
    "tagalog": "mga kahulugan",
    "vietnamese": "định nghĩa",
    "arabic": "تعريفات",
    "french": "définitions",
    "korean": "정의",
    "russian": "определения",
    "portuguese": "definições",
    "hindi": "परिभाषाएँ"
  },
  "recently_practiced": {
    "spanish": "recientemente practicado",
    "chinese": "最近练习",
    "tagalog": "kamakailan nagsanay",
    "vietnamese": "vừa luyện tập",
    "arabic": "تمت ممارسته مؤخرًا",
    "french": "récemment pratiqué",
    "korean": "최근에 연습한",
    "russian": "недавно практиковались",
    "portuguese": "recentemente praticado",
    "hindi": "हाल ही में अभ्यास किया गया"
  },
  "unfamiliar_words": {
    "spanish": "palabras desconocidas",
    "chinese": "不熟悉的单词",
    "tagalog": "hindi pamilyar na mga salita",
    "vietnamese": "từ không quen thuộc",
    "arabic": "كلمات غير مألوفة",
    "french": "mots inconnus",
    "korean": "낯선 단어",
    "russian": "незнакомые слова",
    "portuguese": "palavras desconhecidas",
    "hindi": "अनजान शब्द"
  },
  "familiar_words": {
    "spanish": "palabras familiares",
    "chinese": "熟悉的单词",
    "tagalog": "pamilyar na mga salita",
    "vietnamese": "từ quen thuộc",
    "arabic": "كلمات مألوفة",
    "french": "mots familiers",
    "korean": "익숙한 단어",
    "russian": "знакомые слова",
    "portuguese": "palavras familiares",
    "hindi": "परिचित शब्द"
  },
  "mastered_words": {
    "spanish": "palabras dominadas",
    "chinese": "掌握的单词",
    "tagalog": "mga napag-aralan na salita",
    "vietnamese": "từ đã thành thạo",
    "arabic": "كلمات متقنة",
    "french": "mots maîtrisés",
    "korean": "마스터한 단어",
    "russian": "освоенные слова",
    "portuguese": "palavras dominadas",
    "hindi": "अधिग्रहीत शब्द"
  },
  "slang": {
    "spanish": "jerga",
    "chinese": "俚语",
    "tagalog": "salitang balbal",
    "vietnamese": "tiếng lóng",
    "arabic": "عامية",
    "french": "argot",
    "korean": "속어",
    "russian": "сленг",
    "portuguese": "gíria",
    "hindi": "बोलचाल की भाषा"
  },
  "medical": {
    "spanish": "médico",
    "chinese": "医学",
    "tagalog": "medikal",
    "vietnamese": "y khoa",
    "arabic": "طبي",
    "french": "médical",
    "korean": "의료",
    "russian": "медицинский",
    "portuguese": "médico",
    "hindi": "चिकित्सा"
  },
  "financial": {
    "spanish": "financiero",
    "chinese": "金融",
    "tagalog": "pinansyal",
    "vietnamese": "tài chính",
    "arabic": "مالي",
    "french": "financier",
    "korean": "재정의",
    "russian": "финансовый",
    "portuguese": "financeiro",
    "hindi": "वित्तीय"
  },
  "all_words": {
    "spanish": "todas las palabras",
    "chinese": "所有单词",
    "tagalog": "lahat ng mga salita",
    "vietnamese": "tất cả các từ",
    "arabic": "جميع الكلمات",
    "french": "tous les mots",
    "korean": "모든 단어",
    "russian": "все слова",
    "portuguese": "todas as palavras",
    "hindi": "सभी शब्द"
  },
  "search": {
    "spanish": "buscar",
    "chinese": "搜索",
    "tagalog": "maghanap",
    "vietnamese": "tìm kiếm",
    "arabic": "بحث",
    "french": "rechercher",
    "korean": "검색",
    "russian": "поиск",
    "portuguese": "pesquisar",
    "hindi": "खोज"
  },
  "cancel": {
    "spanish": "cancelar",
    "chinese": "取消",
    "tagalog": "kanselahin",
    "vietnamese": "hủy bỏ",
    "arabic": "إلغاء",
    "french": "annuler",
    "korean": "취소",
    "russian": "отменить",
    "portuguese": "cancelar",
    "hindi": "रद्द करें"
  },
  "practice": {
    "spanish": "practicar",
    "chinese": "练习",
    "tagalog": "magsanay",
    "vietnamese": "luyện tập",
    "arabic": "ممارسة",
    "french": "pratiquer",
    "korean": "연습",
    "russian": "практиковать",
    "portuguese": "praticar",
    "hindi": "अभ्यास"
  },
  "choose_the_best_answer": {
    "spanish": "Elija la mejor respuesta",
    "chinese": "选择最佳答案",
    "tagalog": "Piliin ang pinakamahusay na sagot",
    "vietnamese": "Chọn câu trả lời tốt nhất",
    "arabic": "اختر أفضل إجابة",
    "french": "Choisissez la meilleure réponse",
    "korean": "가장 좋은 답을 고르세요",
    "russian": "Выберите лучший ответ",
    "portuguese": "Escolha a melhor resposta",
    "hindi": "सबसे अच्छा उत्तर चुनें"
  },
  "write_a_sentence_with_these_words": {
    "spanish": "Escribe una oración con estas palabras",
    "chinese": "用这些词写一个句子",
    "tagalog": "Sumulat ng pangungusap gamit ang mga salitang ito",
    "vietnamese": "Viết một câu với những từ này",
    "arabic": "اكتب جملة بهذه الكلمات",
    "french": "Écrivez une phrase avec ces mots",
    "korean": "이 단어들로 문장을 작성하세요",
    "russian": "Напишите предложение с этими словами",
    "portuguese": "Escreva uma frase com estas palavras",
    "hindi": "इन शब्दों के साथ एक वाक्य लिखें"
  },
  "star_earned": {
    "spanish": "¡Estrella ganada!",
    "chinese": "获得星星！",
    "tagalog": "Bituin na nakuha!",
    "vietnamese": "Đã kiếm được ngôi sao!",
    "arabic": "حصلت على نجمة!",
    "french": "Étoile gagnée!",
    "korean": "별 획득!",
    "russian": "Звезда заработана!",
    "portuguese": "Estrela conquistada!",
    "hindi": "तारा अर्जित!"
  },
  "good_job": {
    "spanish": "¡Buen trabajo!",
    "chinese": "干得好！",
    "tagalog": "Magaling!",
    "vietnamese": "Làm tốt lắm!",
    "arabic": "عمل جيد!",
    "french": "Bon travail!",
    "korean": "잘 했어!",
    "russian": "Хорошая работа!",
    "portuguese": "Bom trabalho!",
    "hindi": "शाबाश!"
  },
  "not_quite": {
    "spanish": "¡No del todo!",
    "chinese": "不完全是！",
    "tagalog": "Hindi masyadong!",
    "vietnamese": "Chưa hẳn!",
    "arabic": "ليس تماما!",
    "french": "Pas tout à fait!",
    "korean": "아직 아니야!",
    "russian": "Не совсем!",
    "portuguese": "Não exatamente!",
    "hindi": "अभी नहीं!"
  },
  "positive_statements": {
    "spanish": ["¡Excelente!", "¡Sigue así!", "¡Fantástico!", "¡Impresionante!", "¡Muy bien!", "¡Estupendo!", "¡Buen trabajo!", "¡Maravilloso!", "¡Perfecto!", "¡Lo estás haciendo genial!"],
    "chinese": ["很好！", "继续保持！", "太棒了！", "令人印象深刻！", "非常好！", "优秀！", "好工作！", "精彩！", "完美！", "你做得很好！"],
    "tagalog": ["Mahusay!", "I-keep up mo yan!", "Kahanga-hanga!", "Nakaka-impress!", "Napakagaling!", "Napakaganda!", "Magandang trabaho!", "Kamangha-mangha!", "Perpekto!", "Ginagawa mo ng mahusay!"],
    "vietnamese": ["Xuất sắc!", "Tiếp tục đi!", "Tuyệt vời!", "Ấn tượng!", "Rất tốt!", "Tuyệt vời!", "Làm tốt lắm!", "Tuyệt hảo!", "Hoàn hảo!", "Bạn đang làm rất tốt!"],
    "arabic": ["ممتاز!", "واصل هكذا!", "رائع!", "مثير للإعجاب!", "جيد جداً!", "ممتاز!", "عمل جيد!", "رائع!", "مثالي!", "أنت تقوم بعمل رائع!"],
    "french": ["Excellent!", "Continuez comme ça!", "Fantastique!", "Impressionnant!", "Très bien!", "Super!", "Bon travail!", "Merveilleux!", "Parfait!", "Tu fais du bon travail!"],
    "korean": ["훌륭해!", "계속 그렇게 해!", "대단해!", "인상적이야!", "아주 좋아!", "멋져!", "잘했어!", "놀라워!", "완벽해!", "너 잘하고 있어!"],
    "russian": ["Отлично!", "Так держать!", "Фантастика!", "Впечатляюще!", "Очень хорошо!", "Превосходно!", "Хорошая работа!", "Замечательно!", "Идеально!", "Ты делаешь это отлично!"],
    "portuguese": ["Excelente!", "Continue assim!", "Fantástico!", "Impressionante!", "Muito bem!", "Ótimo!", "Bom trabalho!", "Maravilhoso!", "Perfeito!", "Você está indo muito bem!"],
    "hindi": ["बहुत बढ़िया!", "ऐसे ही करते रहो!", "शानदार!", "प्रभावशाली!", "बहुत अच्छा!", "उत्कृष्ट!", "अच्छा काम!", "अद्भुत!", "सही!", "आप बहुत अच्छा कर रहे हैं!"]
  },
  "negative_statements": {
    "spanish": ["¡Casi!", "¡Inténtalo de nuevo!", "¡No está mal!", "¡Casi allí!", "¡Un poco más de esfuerzo!", "¡Puedes hacerlo mejor!", "¡No te rindas!", "¡Sigue intentándolo!", "¡No te preocupes!", "¡Lo harás mejor la próxima vez!"],
    "chinese": ["差一点！", "再试一次！", "不错！", "快到了！", "再加把劲！", "你可以做得更好！", "别放弃！", "继续努力！", "别担心！", "下次会更好！"],
    "tagalog": ["Malapit na!", "Subukan muli!", "Hindi masama!", "Malapit na!", "Kailangan lang ng kaunting pagsusumikap!", "Kaya mo pang gumawa ng mas mahusay!", "Huwag sumuko!", "Patuloy na subukan!", "Huwag mag-alala!", "Mas magiging mahusay ka sa susunod!"],
    "vietnamese": ["Gần rồi!", "Thử lại lần nữa!", "Không tệ!", "Gần tới rồi!", "Chỉ cần cố gắng thêm chút nữa!", "Bạn có thể làm tốt hơn!", "Đừng bỏ cuộc!", "Tiếp tục cố gắng!", "Đừng lo!", "Lần sau sẽ tốt hơn!"],
    "arabic": ["قريب!", "حاول مرة أخرى!", "ليس سيئاً!", "قريب!", "المزيد من الجهد!", "يمكنك أن تفعل أفضل!", "لا تستسلم!", "استمر في المحاولة!", "لا تقلق!", "ستكون أفضل في المرة القادمة!"],
    "french": ["Presque!", "Réessayez!", "Pas mal!", "Presque là!", "Encore un peu d'effort!", "Vous pouvez faire mieux!", "Ne lâchez pas!", "Continuez à essayer!", "Ne vous inquiétez pas!", "Vous ferez mieux la prochaine fois!"],
    "korean": ["거의 다 왔어!", "다시 시도해!", "나쁘지 않아!", "거의 다 왔어!", "조금만 더 힘내!", "더 잘할 수 있어!", "포기하지 마!", "계속 시도해!", "걱정 마!", "다음 번에는 더 잘할 거야!"],
    "russian": ["Почти получилось!", "Попробуй еще раз!", "Неплохо!", "Почти там!", "Еще немного усилий!", "Ты можешь лучше!", "Не сдавайся!", "Продолжай пытаться!", "Не волнуйся!", "В следующий раз будет лучше!"],
    "portuguese": ["Quase!", "Tente novamente!", "Nada mal!", "Quase lá!", "Só mais um pouco de esforço!", "Você pode fazer melhor!", "Não desista!", "Continue tentando!", "Não se preocupe!", "Você vai se sair melhor da próxima vez!"],
    "hindi": ["लगभग!", "फिर से प्रयास करें!", "बुरा नहीं!", "लगभग पहुँच गए!", "थोड़ी और मेहनत!", "आप बेहतर कर सकते हैं!", "हार मत मानो!", "प्रयास करते रहो!", "चिंता मत करो!", "अगली बार बेहतर करोगे!"]
  },
  "see_all": {
    "spanish": "ver todo",
    "chinese": "查看全部",
    "tagalog": "tingnan lahat",
    "vietnamese": "xem tất cả",
    "arabic": "مشاهدة الكل",
    "french": "voir tout",
    "korean": "모두 보기",
    "russian": "увидеть все",
    "portuguese": "ver tudo",
    "hindi": "सभी देखें"
  }
}

export default function CameraPage({language}) {

  const [words, setWords] = useState([])

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
        console.log(words)
      })
  }

  useEffect(() => {
    getWords()
  }, [])


  const genAI = new GoogleGenerativeAI(Config.API_KEY);
  const [originalWord, setOriginalWord] = useState(null)
  const [originalDefinition, setOriginalDefinition] = useState(null)
  const [translatedWord, setTranslatedWord] = useState(null)
  const [translatedDefinition, setTranslatedDefinition] = useState(null)
  const [loading, setLoading] = useState(false)

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

  const addWord = (originalWord, originalDefinition, translatedWord, translatedDefinition) => {
    const uid = auth().currentUser.uid;
    database()
      .ref(`/${uid}/words`)
      .update({
        [originalWord]: {
          translatedWord: translatedWord,
          definition: originalDefinition,
          translatedDefinition: translatedDefinition,
          score: 0
        }
      })
      .then(() => console.log("Done!")).catch(error => {
        console.error("Failed to add word to database:", error);
      });
  }

  const bottomSheetRef = useRef(null)


  function openTextSheet() {
    bottomSheetRef.current.snapToIndex(0);
  }

  const define = async (imageData) => {

    console.log(Config.API_KEY)

    const prompt = `
    Determine the root word of the highlighted word in the image (ex. leaving -> leave).
    Provide the word and definition in the original language of the word; additionally, provide the word and definition in ${language}. 
    Definitions should be 12 words or less. Everything must be lowercase.
    Use this JSON schema:
    { "originalWord": "string",
      "originalDefinition": "string", 
      "translatedWord": "string",
      "translatedDefinition": "string"
    }`

    const result = await model.generateContent([prompt, { inlineData: { data: imageData, mimeType: 'image/png' } }]);
    const response = result.response;
    const text = JSON.parse(response.text());
    console.log(text)
    console.log("response")
    setOriginalWord(text.originalWord)
    setOriginalDefinition(text.originalDefinition)
    setTranslatedWord(text.translatedWord)
    setTranslatedDefinition(text.translatedDefinition)
    addWord(text.originalWord, text.originalDefinition, text.translatedWord, text.translatedDefinition);
    openTextSheet();
    setLoading(false)

    // setResponse(JSON.stringify(text))
  }


  const [paths, setPaths] = useState([]);
  const canvasRef = useCanvasRef();


  const camera = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(true);
  const [image, setImage] = useState(null);
  const loadedImage = useImage(image);
  const device = useCameraDevice('back')
  const { hasPermission, requestPermission } = useCameraPermission()

  const [currentPosition, setCurrentPosition] = useState(-1)

  const saveMarkedUpImage = async () => {
    console.log("sup")
    setLoading(true)
    const image = await canvasRef.current.makeImageSnapshotAsync();
    const bytes = image.encodeToBase64();
    // console.log(bytes)
    define(bytes)

  };

  const [tGestureStart, setTGestureStart] = useState(null);
  const [tGestureMove, setTGestureMove] = useState(null);
  const [tGestureUpdate, setTGestureUpdate] = useState(null);
  const [tGestureEnd, setTGestureEnd] = useState(null);

  const pan = Gesture.Pan()
    .onStart((g) => {
      const newPaths = [...paths];
      newPaths[paths.length] = {
        segments: [],
        color: "yellow",
      };
      newPaths[paths.length].segments.push(`M ${g.x} ${g.y}`);
      runOnJS(setPaths)(newPaths);
      runOnJS(setTGestureStart)(`${Math.round(g.x)}, ${Math.round(g.y)}`);
    })
    .onUpdate((g) => {
      const index = paths.length - 1;
      const newPaths = [...paths];
      if (newPaths?.[index]?.segments) {
        newPaths[index].segments.push(`L ${g.x} ${g.y}`);
        runOnJS(setPaths)(newPaths);
      }
    }).minDistance(1)
  useEffect(() => {
    if (!hasPermission)
      requestPermission()

  }, [])


  if (hasPermission)
    return (
      // <SafeAreaView style={styles.backgroundContainer}>
      <>
        <View style={{ backgroundColor: "black", flex: 1 }}>

          {cameraOpen ?
            <>
              <Camera
                ref={camera}
                style={{ width: screenWidth, height: screenHeight, position: "absolute"}}
                device={device}
                isActive={true}
                photo={true}
              >
              </Camera>
              <View style={{ flex: 1, }}>
                <View style={styles.buttonContainer}>
                  <Pressable style={{ ...styles.actionButton, opacity: 0 }}>
                    <Text style={styles.languageText}>EN</Text>
                  </Pressable>
                  <Pressable onPress={async () => {
                    const photo = await camera.current.takePhoto();
                    console.log(photo.path)
                    setCameraOpen(false)
                    setImage(photo.path)
                    // highlightPhoto(photo.path)
                  }}>
                    <Svg
                      width={80}
                      height={80}
                      viewBox="0 0 72 72"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <Circle cx={36} cy={36} r={30} fill="#F0E8DD" />
                      <Circle cx={36} cy={36} r={34.5} stroke="#F0E8DD" strokeWidth={3} />
                    </Svg>
                  </Pressable>
                  <Pressable style={styles.actionButton}>
                    <SFSymbol name="photo.on.rectangle.angled" size={25} color="white" />
                  </Pressable>
                </View>
              </View>
            </>
            : <>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <GestureDetector gesture={pan}>
                  <View style={styles.drawingContainer}>
                    {/* <Image source={{
                  uri: image,
                }} style={styles.image} /> */}

                    <Canvas style={styles.canvas} ref={canvasRef}>
                      {/* {testImg ? */}
                      <Image image={loadedImage} fit="cover" x={0} y={0} width={screenWidth} height={screenHeight} />
                      {paths.map((p, index) => (
                        <Path
                          key={index}
                          path={p.segments.join(" ")}
                          strokeWidth={30}
                          style="stroke"
                          color={p.color}
                          opacity={0.5}
                        />
                      ))}
                    </Canvas>
                    <View style={{ ...StyleSheet.absoluteFill, position: "absolute", zIndex: 100 }}>
                      <Pressable onPress={() => {
                        setPaths([]);
                        console.log(loadedImage)
                      }}>
                        <Text style={{ fontSize: 20, position: "absolute", top: screenHeight * 0.08, color: "white", paddingLeft: 20, textShadowColor: 'rgba(0, 0, 0, 0.85)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 }}>{translations.clear[language] || "Clear"}</Text>
                      </Pressable>
                      <Pressable onPress={() => {
                        setCameraOpen(true);
                      }}>
                        <Text style={{ fontSize: 20, position: "absolute", top: screenHeight * 0.08, color: "white", right: 0, paddingRight: 20, textShadowColor: 'rgba(0, 0, 0, 0.85)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 }}>{translations.retake[language] || "Retake"}</Text>
                      </Pressable>
                      <View style={styles.buttonContainer}>
                        <Pressable onPress={() => { if (!loading) saveMarkedUpImage() }} style={styles.bigActionButton}>
                          {!loading
                            ? <SFSymbol name="checkmark" size={32} color="black" />
                            : <ActivityIndicator />
                          }
                        </Pressable>
                      </View>
                      <Text style={{ fontSize: 18, position: "absolute", top: screenHeight * 0.75, alignSelf: "center", color: "white", textShadowColor: 'rgba(0, 0, 0, 0.85)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 }}>{translations.highlight_text_to_translate_to_language[language] || "Highlight text to translate."}</Text>
                    </View>
                  </View>

                </GestureDetector>
              </GestureHandlerRootView>
            </>
          }
        </View>
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={["30%", "80%"]}
          index={-1}
          backgroundStyle={{ backgroundColor: "#F5EEE5" }}
          enablePanDownToClose={true}
          onChange={index => {
              setCurrentPosition(index)
            }}
        >
          <BottomSheetView style={styles.contentContainer}>
            <Text style={styles.title}>{translations.definitions[language] || "Definitions"}</Text>
            <FlatList
              data={words}
              contentContainerStyle={{ gap: 10, paddingBottom: 30, alignSelf: "center" }}
              renderItem={({ item }) => {
                console.log(item)
                return (<Term word={item.word} translatedWord={item.translatedWord} translatedDefinition={item.translatedDefinition} />)
              }}
              ListHeaderComponent={
                currentPosition !== -1 ?
                <Animated.View entering={FadeIn.duration(750)} style={{ ...styles.termContainer, alignSelf: "center",}}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", width: "95%", paddingBottom: 12, }}>
                    <Text style={styles.termTitle}>{originalWord}</Text>
                    <SFSymbol name="speaker.wave.2.fill" size={20} color="#77BEE9" />
                  </View>
                  <Text style={styles.termSubtitle}>{translatedWord} · {translatedDefinition}</Text>
                </Animated.View>
                : <View style={{ ...styles.termContainer, alignSelf: "center", opacity: 0}}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "95%", paddingBottom: 12, }}>
                  <Text style={styles.termTitle}>{originalWord}</Text>
                  <SFSymbol name="speaker.wave.2.fill" size={20} color="#77BEE9" />
                </View>
                <Text style={styles.termSubtitle}>{translatedWord} · {translatedDefinition}</Text>
              </View>
              }


              // scrollEnabled={false}
              style={{ paddingBottom: 50 }}
            />
          </BottomSheetView>
        </BottomSheet>
      </>

    )
}

function Term({ word, translatedWord, translatedDefinition }) {
  return (
    <View style={styles.termContainer}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "95%", paddingBottom: 12, }}>
        <Text style={styles.termTitle}>{word}</Text>
        <SFSymbol name="speaker.wave.2.fill" size={20} color="#77BEE9" />
      </View>
      <Text style={styles.termSubtitle}>{translatedWord} · {translatedDefinition}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  termContainer: {
    backgroundColor: "white",
    borderRadius: 26,
    padding: 20,
    width: screenWidth * 0.9,
    height: screenHeight * 0.16

  },
  termTitle: {
    fontFamily: "NewYorkLarge-Regular",
    fontSize: 20,
  },
  termSubtitle: {
    fontSize: 17,
    fontFamily: "SFPro-Regular"
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    fontFamily: "NewYorkLarge-Semibold",
    paddingTop: 10,
    paddingBottom: 20,
    paddingLeft: 30,

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
  drawingContainer: {
    flex: 1,
    position: 'relative',
  },
  backgroundContainer: {
    backgroundColor: "green",
    flex: 1,
    height: "100%"
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    resizeMode: 'contain',
    zIndex: 1,
  },
  canvas: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  languageText: {
    fontFamily: 'SFProRounded-Bold',
    color: "white",
    fontSize: 23,
  },
  actionButton: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F2C2A",
    borderRadius: 25,
  },
  bigActionButton: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0E8DD",
    borderRadius: 40,
  },
  buttonContainer: {
    position: "absolute",
    top: screenHeight * 0.8,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%"
  },
})

