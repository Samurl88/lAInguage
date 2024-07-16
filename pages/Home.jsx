import { View, Text, Pressable, SafeAreaView, StyleSheet, Image, Dimensions, FlatList, Button } from 'react-native'
// import React from 'react'
import auth from '@react-native-firebase/auth';
import React, { useEffect, useRef, useState } from 'react'
import Dictionary from './Dictionary';
import { SFSymbol } from 'react-native-sfsymbols';
import CameraPage from './Camera';
import StudyPage from './Study';
import Animated, { FadeOut, FadeOutDown, FadeOutLeft, FadeOutRight, SlideInDown, SlideInLeft, SlideInRight, SlideInUp, SlideOutDown, SlideOutLeft, SlideOutRight, SlideOutUp, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg"
import database from '@react-native-firebase/database';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient as LinearGradientRN } from 'react-native-linear-gradient';
import * as DropdownMenu from 'zeego/dropdown-menu'
import notifee, { RepeatFrequency, TriggerType } from '@notifee/react-native';
import Settings from './Settings';


const dayjs = require('dayjs')

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

const translations = {
  "dictionary": {
    "spanish": "Diccionario",
    "chinese": "词典",
    "tagalog": "Diksyunaryo",
    "vietnamese": "Từ Điển",
    "arabic": "قاموس",
    "french": "Dictionnaire",
    "korean": "사전",
    "russian": "Словарь",
    "portuguese": "Dicionário",
    "hindi": "शब्दकोश",
    "english": "Dictionary"
  },
  "camera": {
    "spanish": "Cámara",
    "chinese": "相机",
    "tagalog": "Kamera",
    "vietnamese": "Máy Ảnh",
    "arabic": "كاميرا",
    "french": "Caméra",
    "korean": "카메라",
    "russian": "Камера",
    "portuguese": "Câmera",
    "hindi": "कैमरा",
    "english": "Camera"
  },
  "highlight_text_to_translate": {
    "spanish": "Resaltar texto para traducir",
    "chinese": "突出显示要翻译的文本",
    "tagalog": "I-highlight ang teksto upang isalin",
    "vietnamese": "Làm nổi bật văn bản để dịch",
    "arabic": "تسليط الضوء على النص لترجمته",
    "french": "Surligner le texte à traduire",
    "korean": "번역할 텍스트 강조 표시",
    "russian": "Выделить текст для перевода",
    "portuguese": "Destacar texto para traduzir",
    "hindi": "अनुवाद के लिए पाठ को हाइलाइट करें",
    "english": "Highlight text to translate"
  },
  "clear": {
    "spanish": "Borrar",
    "chinese": "擦除",
    "tagalog": "Burahin",
    "vietnamese": "Xóa",
    "arabic": "مسح",
    "french": "Effacer",
    "korean": "지우기",
    "russian": "Стереть",
    "portuguese": "Apagar",
    "hindi": "मिटाना",
    "english": "Erase"
  },
  "retake": {
    "spanish": "Volver a tomar",
    "chinese": "重拍",
    "tagalog": "Muling kunan",
    "vietnamese": "Chụp lại",
    "arabic": "إعادة",
    "french": "Reprendre",
    "korean": "다시 찍기",
    "russian": "Переснять",
    "portuguese": "Repetir",
    "hindi": "पुनः लेना",
    "english": "Retake"
  },
  "done": {
    "spanish": "Hecho",
    "chinese": "完成",
    "tagalog": "Tapos na",
    "vietnamese": "Xong",
    "arabic": "تم",
    "french": "Terminé",
    "korean": "완료",
    "russian": "Готово",
    "portuguese": "Feito",
    "hindi": "पूर्ण",
    "english": "Done"
  },
  "definitions": {
    "spanish": "Definiciones",
    "chinese": "定义",
    "tagalog": "Mga Kahulugan",
    "vietnamese": "Định Nghĩa",
    "arabic": "التعاريف",
    "french": "Définitions",
    "korean": "정의",
    "russian": "Определения",
    "portuguese": "Definições",
    "hindi": "परिभाषाएँ",
    "english": "Definitions"
  },
  "practice": {
    "spanish": "Practicar",
    "chinese": "练习",
    "tagalog": "Magsanay",
    "vietnamese": "Thực Hành",
    "arabic": "ممارسة",
    "french": "Pratiquer",
    "korean": "연습",
    "russian": "Практика",
    "portuguese": "Praticar",
    "hindi": "अभ्यास",
    "english": "Practice"
  },
  "quiz_yourself": {
    "spanish": "Ponerse a prueba",
    "chinese": "自测",
    "tagalog": "I-quiz ang iyong sarili",
    "vietnamese": "Tự kiểm tra",
    "arabic": "اختبر نفسك",
    "french": "Teste-toi",
    "korean": "퀴즈 풀기",
    "russian": "Проверь себя",
    "portuguese": "Faça um teste",
    "hindi": "स्वयं का परीक्षण करें",
    "english": "Quiz yourself"
  },
  "choose_the_best_answer": {
    "spanish": "Elige la mejor respuesta",
    "chinese": "选择最佳答案",
    "tagalog": "Piliin ang pinakamahusay na sagot",
    "vietnamese": "Chọn câu trả lời tốt nhất",
    "arabic": "اختر أفضل إجابة",
    "french": "Choisissez la meilleure réponse",
    "korean": "가장 좋은 답변을 선택하세요",
    "russian": "Выберите лучший ответ",
    "portuguese": "Escolha a melhor resposta",
    "hindi": "सबसे अच्छा उत्तर चुनें",
    "english": "Choose the best answer"
  },
  "preparing_your_session": {
    "spanish": "Preparando su sesión",
    "chinese": "准备你的会议",
    "tagalog": "Inihahanda ang iyong session",
    "vietnamese": "Chuẩn bị phiên của bạn",
    "arabic": "تحضير جلستك",
    "french": "Préparation de votre session",
    "korean": "세션 준비 중",
    "russian": "Подготовка вашей сессии",
    "portuguese": "Preparando sua sessão",
    "hindi": "आपका सत्र तैयार हो रहा है",
    "english": "Preparing your session"
  },
  "what_is_the_meaning_of": {
    "spanish": "Cuál es el significado de",
    "chinese": "是什么意思",
    "tagalog": "Ano ang kahulugan ng",
    "vietnamese": "Nghĩa của là gì",
    "arabic": "ما هو معنى",
    "french": "Quelle est la signification de",
    "korean": "의 의미는 무엇입니까",
    "russian": "Что означает",
    "portuguese": "Qual é o significado de",
    "hindi": "का अर्थ क्या है",
    "english": "What is the meaning of"
  },
  "write_a_sentence_with_the_following_word": {
    "spanish": "Escribe una oración con la siguiente palabra",
    "chinese": "用以下单词写一个句子",
    "tagalog": "Sumulat ng pangungusap gamit ang sumusunod na salita",
    "vietnamese": "Viết một câu với từ sau",
    "arabic": "اكتب جملة بالكلمة التالية",
    "french": "Écrivez une phrase avec le mot suivant",
    "korean": "다음 단어로 문장을 작성하세요",
    "russian": "Напишите предложение с следующим словом",
    "portuguese": "Escreva uma frase com a seguinte palavra",
    "hindi": "निम्नलिखित शब्द के साथ एक वाक्य लिखें",
    "english": "Write a sentence with the following word"
  },
  "start_typing": {
    "spanish": "Empieza a escribir",
    "chinese": "开始输入",
    "tagalog": "Magsimulang mag-type",
    "vietnamese": "Bắt đầu gõ",
    "arabic": "ابدأ الكتابة",
    "french": "Commencez à taper",
    "korean": "타이핑 시작",
    "russian": "Начните печатать",
    "portuguese": "Comece a digitar",
    "hindi": "टाइप करना शुरू करें",
    "english": "Start typing"
  },
  "great_work": {
    "spanish": "¡Gran trabajo!",
    "chinese": "干得好！",
    "tagalog": "Mahusay na trabaho!",
    "vietnamese": "Làm tốt lắm!",
    "arabic": "عمل رائع!",
    "french": "Bon travail!",
    "korean": "잘했어요!",
    "russian": "Отличная работа!",
    "portuguese": "Ótimo trabalho!",
    "hindi": "उत्तम कार्य!",
    "english": "Great work!"
  },
  "thats_another_star_for_your_collection": {
    "spanish": "¡Esa es otra estrella para tu colección.",
    "chinese": "那是你收藏的另一颗星星.",
    "tagalog": "Iyan ay isa pang bituin para sa iyong koleksyon.",
    "vietnamese": "Đó là một ngôi sao khác cho bộ sưu tập của bạn.",
    "arabic": "هذه نجمة أخرى لمجموعتك.",
    "french": "C'est une autre étoile pour ta collection.",
    "korean": "그것은 당신의 컬렉션에 또 하나의 별입니다.",
    "russian": "Это еще одна звезда в вашу коллекцию.",
    "portuguese": "Essa é outra estrela para sua coleção.",
    "hindi": "यह आपके संग्रह के लिए एक और सितारा है.",
    "english": "That's another star for your collection."
  },
  "search": {
    "spanish": "Buscar",
    "chinese": "搜索",
    "tagalog": "Maghanap",
    "vietnamese": "Tìm Kiếm",
    "arabic": "بحث",
    "french": "Rechercher",
    "korean": "검색",
    "russian": "Поиск",
    "portuguese": "Buscar",
    "hindi": "खोज",
    "english": "Search"
  },
  "unfamiliar": {
    "spanish": "Desconocido",
    "chinese": "陌生的",
    "tagalog": "Hindi Pamilyar",
    "vietnamese": "Không Quen",
    "arabic": "غير مألوف",
    "french": "Inconnu",
    "korean": "익숙하지 않은",
    "russian": "Незнакомый",
    "portuguese": "Desconhecido",
    "hindi": "अनजान",
    "english": "Unfamiliar"
  },
  "familiar": {
    "spanish": "Familiar",
    "chinese": "熟悉的",
    "tagalog": "Pamilyar",
    "vietnamese": "Quen Thuộc",
    "arabic": "مألوف",
    "french": "Familier",
    "korean": "익숙한",
    "russian": "Знакомый",
    "portuguese": "Familiar",
    "hindi": "परिचित",
    "english": "Familiar"
  },
  "mastered": {
    "spanish": "Dominado",
    "chinese": "精通",
    "tagalog": "Nasasaklawan",
    "vietnamese": "Thạo",
    "arabic": "تمكن",
    "french": "Maîtrisé",
    "korean": "정복한",
    "russian": "Освоенный",
    "portuguese": "Dominado",
    "hindi": "निपुण",
    "english": "Mastered"
  },
  "scan_a_term_to_get_started": {
    "spanish": "¡Escanea un término para comenzar!",
    "chinese": "扫描一个术语以开始！",
    "tagalog": "I-scan ang isang termino upang makapagsimula!",
    "vietnamese": "Quét một thuật ngữ để bắt đầu!",
    "arabic": "امسح مصطلحًا للبدء!",
    "french": "Scannez un terme pour commencer!",
    "korean": "용어를 스캔하여 시작하세요!",
    "russian": "Сканируйте термин, чтобы начать!",
    "portuguese": "Escaneie um termo para começar!",
    "hindi": "प्रारंभ करने के लिए एक शब्द स्कैन करें!",
    "english": "Scan a term to get started!"
  },
  "settings": {
    "spanish": "Configuración",
    "chinese": "设置",
    "tagalog": "Mga Setting",
    "vietnamese": "Cài Đặt",
    "arabic": "إعدادات",
    "french": "Paramètres",
    "korean": "설정",
    "russian": "Настройки",
    "portuguese": "Configurações",
    "hindi": "सेटिंग्स",
    "english": "Settings"
  },
  "study_options": {
    "spanish": "Opciones De Estudio",
    "chinese": "学习选项",
    "tagalog": "Mga Pagpipilian Sa Pag-Aaral",
    "vietnamese": "Tùy Chọn Học Tập",
    "arabic": "خيارات الدراسة",
    "french": "Options D'Étude",
    "korean": "학습 옵션",
    "russian": "Варианты Обучения",
    "portuguese": "Opções De Estudo",
    "hindi": "अध्ययन विकल्प",
    "english": "Study Options"
  },
  "misc": {
    "spanish": "Varios",
    "chinese": "杂项",
    "tagalog": "Iba Pa",
    "vietnamese": "Linh Tinh",
    "arabic": "متفرقات",
    "french": "Divers",
    "korean": "기타",
    "russian": "Разное",
    "portuguese": "Diversos",
    "hindi": "विविध",
    "english": "Misc."
  },
  "terms_per_session": {
    "spanish": "Términos Por Sesión",
    "chinese": "每次会话的术语",
    "tagalog": "Mga Termino Bawat Sesyon",
    "vietnamese": "Thuật Ngữ Mỗi Phiên",
    "arabic": "مصطلحات لكل جلسة",
    "french": "Termes Par Session",
    "korean": "세션당 용어",
    "russian": "Термины На Сессию",
    "portuguese": "Termos Por Sessão",
    "hindi": "प्रति सत्र शब्द",
    "english": "Terms Per Session"
  },
  "daily_reminders": {
    "spanish": "Recordatorios Diarios",
    "chinese": "每日提醒",
    "tagalog": "Araw-Araw Na Mga Paalala",
    "vietnamese": "Nhắc Nhở Hàng Ngày",
    "arabic": "تذكيرات يومية",
    "french": "Rappels Quotidiens",
    "korean": "매일 알림",
    "russian": "Ежедневные Напоминания",
    "portuguese": "Lembretes Diários",
    "hindi": "दैनिक अनुस्मारक",
    "english": "Daily Reminders"
  },
  "done": {
    "spanish": "Hecho",
    "chinese": "完成",
    "tagalog": "Tapos",
    "vietnamese": "Xong",
    "arabic": "تم",
    "french": "Fait",
    "korean": "완료",
    "russian": "Готово",
    "portuguese": "Feito",
    "hindi": "हो गया",
    "english": "Done"
  },
  "view_all_your_terms_here": {
    "spanish": "¡Ve todos tus términos aquí!",
    "chinese": "在这里查看您的所有术语！",
    "tagalog": "Tingnan ang lahat ng iyong mga termino dito!",
    "vietnamese": "Xem tất cả các thuật ngữ của bạn ở đây!",
    "arabic": "اعرض جميع مصطلحاتك هنا!",
    "french": "Voir tous vos termes ici!",
    "korean": "여기에서 모든 용어를 확인하세요!",
    "russian": "Просмотрите все свои термины здесь!",
    "portuguese": "Veja todos os seus termos aqui!",
    "hindi": "अपने सभी शब्द यहाँ देखें!",
    "english": "View all your terms here!"
  },
  "log_out": {
    "spanish": "Cerrar Sesión",
    "chinese": "登出",
    "tagalog": "Mag-Logout",
    "vietnamese": "Đăng Xuất",
    "arabic": "تسجيل خروج",
    "french": "Déconnexion",
    "korean": "로그아웃",
    "russian": "Выйти",
    "portuguese": "Sair",
    "hindi": "लॉग आउट",
    "english": "Log Out"
  },
  "capture_text_to_translate": {
    "spanish": "Captura texto para traducir.",
    "chinese": "捕捉要翻译的文本。",
    "tagalog": "Kuhain ang teksto upang isalin.",
    "vietnamese": "Chụp văn bản để dịch.",
    "arabic": "التقط النص للترجمة.",
    "french": "Capturez le texte à traduire.",
    "korean": "번역할 텍스트 캡처.",
    "russian": "Захватите текст для перевода.",
    "portuguese": "Capture texto para traduzir.",
    "hindi": "अनुवाद के लिए पाठ को कैप्चर करें।",
    "english": "Capture text to translate."
  },
  "word_already_scanned": {
    "spanish": "¡Palabra ya escaneada!",
    "chinese": "词语已扫描！",
    "tagalog": "Na-scan na ang salita!",
    "vietnamese": "Từ đã được quét!",
    "arabic": "تم مسح الكلمة بالفعل!",
    "french": "Mot déjà scanné !",
    "korean": "이미 스캔된 단어!",
    "russian": "Слово уже отсканировано!",
    "portuguese": "Palavra já escaneada!",
    "hindi": "शब्द पहले ही स्कैन किया जा चुका है!",
    "english": "Word already scanned!"
  },
  "please_check_your_dictionary": {
    "spanish": "Por favor, revisa tu diccionario.",
    "chinese": "请检查您的词典。",
    "tagalog": "Paki-check ang iyong diksyunaryo.",
    "vietnamese": "Vui lòng kiểm tra từ điển của bạn.",
    "arabic": "يرجى التحقق من قاموسك.",
    "french": "Veuillez vérifier votre dictionnaire.",
    "korean": "사전을 확인해 주세요.",
    "russian": "Пожалуйста, проверьте свой словарь.",
    "portuguese": "Por favor, verifique seu dicionário.",
    "hindi": "कृपया अपना शब्दकोश जांचें।",
    "english": "Please check your dictionary."
  },
  "no_word_was_detected": {
    "spanish": "¡No se detectó ninguna palabra!",
    "chinese": "未检测到任何词语！",
    "tagalog": "Walang salita ang natagpuan!",
    "vietnamese": "Không phát hiện thấy từ nào!",
    "arabic": "لم يتم اكتشاف أي كلمة!",
    "french": "Aucun mot n'a été détecté!",
    "korean": "단어가 감지되지 않았습니다!",
    "russian": "Слово не было обнаружено!",
    "portuguese": "Nenhuma palavra foi detectada!",
    "hindi": "कोई शब्द नहीं मिला!",
    "english": "No word was detected!"
  },
  "please_try_again": {
    "spanish": "Por favor, inténtalo de nuevo.",
    "chinese": "请再试一次。",
    "tagalog": "Paki-subukan ulit.",
    "vietnamese": "Vui lòng thử lại.",
    "arabic": "يرجى المحاولة مرة أخرى.",
    "french": "Veuillez réessayer.",
    "korean": "다시 시도해 주세요.",
    "russian": "Пожалуйста, попробуйте снова.",
    "portuguese": "Por favor, tente novamente.",
    "hindi": "कृपया पुन: प्रयास करें।",
    "english": "Please try again."
  },
  "ok": {
    "spanish": "Vale",
    "chinese": "好",
    "tagalog": "OK",
    "vietnamese": "Đồng ý",
    "arabic": "حسنًا",
    "french": "D'accord",
    "korean": "확인",
    "russian": "Хорошо",
    "portuguese": "OK",
    "hindi": "ठीक है",
    "english": "OK"
  },
  "dictionary_options": {
    "spanish": "Opciones De Diccionario",
    "chinese": "词典选项",
    "tagalog": "Mga Pagpipilian Sa Diksyunaryo",
    "vietnamese": "Tùy Chọn Từ Điển",
    "arabic": "خيارات القاموس",
    "french": "Options De Dictionnaire",
    "korean": "사전 옵션",
    "russian": "Варианты Словаря",
    "portuguese": "Opções De Dicionário",
    "hindi": "शब्दकोश विकल्प",
    "english": "Dictionary Options"
  },
  "language": {
    "spanish": "Idioma",
    "chinese": "语言",
    "tagalog": "Wika",
    "vietnamese": "Ngôn Ngữ",
    "arabic": "اللغة",
    "french": "Langue",
    "korean": "언어",
    "russian": "Язык",
    "portuguese": "Idioma",
    "hindi": "भाषा",
    "english": "Language"
  },
  "enunciation_speed": {
    "spanish": "Velocidad De Pronunciación",
    "chinese": "发音速度",
    "tagalog": "Bilis Ng Pagbigkas",
    "vietnamese": "Tốc Độ Phát Âm",
    "arabic": "سرعة النطق",
    "french": "Vitesse De Prononciation",
    "korean": "발음 속도",
    "russian": "Скорость Произношения",
    "portuguese": "Velocidade De Pronúncia",
    "hindi": "उच्चारण गति",
    "english": "Enunciation Speed"
  }
}



export default function HomePage({ navigation }) {
  const [cameraPage, setCameraPage] = useState(true)
  const [studyPage, setStudyPage] = useState(false)
  const [dictionaryPage, setDictionaryPage] = useState(false)
  const [settingsPage, setSettingsPage] = useState(false)

  const [userLanguage, setUserLanguage] = useState(null)
  const [stars, setStars] = useState(null);
  const [lastCompleted, setLastCompleted] = useState(null);
  const [termsPerSession, setTermsPerSession] = useState(null);
  const [notifications, setNotifications] = useState(null)
  const [wordSpeed, setWordSpeed] = useState(null);

  const [words, setWords] = useState(null)


  // https://blog.teamairship.com/creating-reminders-with-notifee -> workaround for notifee scheduling bug
  const scheduleRepeatingReminder = async (timestamp) => {
    const week = new Array(7).fill('');
    
    const prev = dayjs(lastCompleted).hour(0).minute(0).second(0).millisecond(0);
    const now = dayjs().date(10)
    let difference = now.diff(prev, 'day')

    // console.log(difference)

    for await (const [index, _day] of week.entries()) {
      // Don't set a reminder if already completed today.
      if (index === 0 && difference === 0) {
        continue
      } else {
        const dayTimestamp = dayjs(timestamp).add(index, 'day').hour(12).minute(0).second(0).valueOf();
        const validTimestamp =
          dayTimestamp > new Date().getTime()
            ? dayTimestamp
            : dayjs(dayTimestamp).add(1, 'week').valueOf();

        // console.log(dayjs(validTimestamp).format('ddd'))
        await notifee.createTriggerNotification(
          {
            id: dayjs(validTimestamp).format('ddd'),
            title: 'Practice!',
            body: `Don't lose your streak!`
          },
          {
            type: TriggerType.TIMESTAMP,
            timestamp: validTimestamp,
            repeatFrequency: RepeatFrequency.WEEKLY
          }
        )
      }
    }
  };

  // Sets up daily notifications
  useEffect(() => {
    if (notifications && lastCompleted) {
      notifee.requestPermission().then(
        notifee.cancelAllNotifications().then(() => {
          scheduleRepeatingReminder(new Date);
        }
        ))
    }

  }, [])

  // Subscribe to changes in profile
  useEffect(() => {
    let uid = auth().currentUser.uid;
    const onValueChange = database()
      .ref(`${uid}/profile`)
      .on('value', snapshot => {
        let data = snapshot.val()
        let lang = data?.language
        setUserLanguage(lang)

        // if (!lang) {
        //   // database()
        //   // .ref(`/${uid}/profile`)
        //   // .update({
        //   //     language: 'english',
        //   //     stars: 0,
        //   //     lastCompleted: JSON.stringify(dayjs().year(2000)),
        //   //     notifications: true,
        //   //     termsPerSession: 10
        //   //     wordSpeed: 1
        //   // })
        //   auth()
        //   .signOut()
        // }

        let stars = data?.stars ? data.stars : 0
        setStars(stars)

        let lastCompleted = data?.lastCompleted ? JSON.parse(data.lastCompleted) : null
        setLastCompleted(lastCompleted)

        let termsPerSession = data?.termsPerSession;
        setTermsPerSession(termsPerSession)
        // console.log(termsPerSession)

        let notifications = data?.notifications;
        setNotifications(notifications)

        let wordSpeed = data?.wordSpeed;
        setWordSpeed(wordSpeed)

        return () => database().ref(`${uid}/profile`).off('value', onValueChange);
      })
  }, [])


  // Subscribes to changes in words
  useEffect(() => {
    let uid = auth().currentUser.uid;
    const onValueChange = database()
      .ref(`${uid}/words`)
      .on('value', snapshot => {
        let data = snapshot.val()
        setWords(data)
        return () => database().ref(`${uid}/words`).off('value', onValueChange);
      })
  }, [])


  const rotateStar = useSharedValue("0deg")
  const size = useSharedValue(20)
  const opacity = useSharedValue(0)

  useEffect(() => {
    rotateStar.value = withSequence(withTiming("360deg", { duration: 1000 }), withTiming("0deg", { duration: 0 }))
    size.value = withDelay(250, withSequence(withTiming(30, { duration: 250 }), withTiming(20, { duration: 250 })))
    opacity.value = withSequence(withTiming(1, { duration: 500 }), withDelay(500, withTiming(0, { duration: 500 })))
  }, [stars])

  function logOut() {
    setSettingsPage(false)
    auth()
      .signOut()
  }



  // Variable direction for tab bar screen transitions
  const exitDirection = useSharedValue(null);
  const slideOutLeftAnimation = new SlideOutLeft().build();
  const slideOutRightAnimation = new SlideOutRight().build();

  const slideInLeftAnimation = new SlideInLeft().build();
  const slideInRightAnimation = new SlideInRight().build();

  const CustomExitingAnimation = (values) => {
    'worklet';

    return exitDirection.value === 'left'
      ? slideOutLeftAnimation(values)
      : slideOutRightAnimation(values);
  }

  const CustomEnteringAnimation = (values) => {
    'worklet';

    return exitDirection.value === 'left'
      ? slideInLeftAnimation(values)
      : slideInRightAnimation(values);
  }

  // For extendable tab bar
  const tabBarWidth = useSharedValue(0.5 * screenWidth)
  const edgeOpacity = useSharedValue(0)


  function toDictionaryPage() {
    setCameraPage(false)
    setDictionaryPage(true)
    tabBarWidth.value = withTiming(0.85 * screenWidth)
    edgeOpacity.value = withTiming(1)
  }


  function toPractice() {
    setCameraPage(false)
    setStudyPage(true)
    setDictionaryPage(false)
    tabBarWidth.value = withTiming(0.85 * screenWidth)
    edgeOpacity.value = withTiming(1)
  }

  if (userLanguage && stars != null)
    return (
      <View style={{ flex: 1, backgroundColor: "#F0E8DD", }}>
        {settingsPage &&
          <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={{ position: "absolute", width: screenWidth, height: screenHeight, zIndex: 1000 }}>
            <Settings language={userLanguage} translations={translations} termsPerSession={termsPerSession} notifications={notifications} close={() => setSettingsPage(false)} logout={logOut} scheduleRepeatingReminder={scheduleRepeatingReminder} wordSpeed={wordSpeed}/>
          </Animated.View>
        }
        <Animated.View style={{ ...styles.tabBar, width: tabBarWidth, alignItems: "center", justifyContent: "space-around" }}>
          {!cameraPage
            ? <Animated.View key={"leftone"} exiting={FadeOut} style={{ opacity: edgeOpacity }}>
              <MaskedView
                style={{}}
                maskElement={
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 7, height: 50, width: 50, justifyContent: "center" }}>
                    <Animated.View style={{ transform: [{ "rotate": rotateStar }] }}>
                      <Svg
                        width={17}
                        height={17}
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
                    <Animated.Text style={{ fontSize: size, fontFamily: "SFPro-Medium" }}>{stars}</Animated.Text>
                  </View>
                }
              >
                {
                  <Animated.View style={{ position: "absolute", zIndex: 1000, opacity: opacity }}>
                    <LinearGradientRN useAngle={true} angle={135} angleCenter={{ x: 0.5, y: 0.5 }} colors={['#65BAEE', '#FD8DFF']} style={{ width: 50, height: 50, }} start={{ x: 0, y: 1 }} end={{ x: 1, y: 1 }} />
                  </Animated.View>
                }
                <View style={{ backgroundColor: "black", width: 50, height: 50 }}></View>

              </MaskedView>
            </Animated.View>
            : null
          }
          <View style={styles.tabBarIcons}>
            <Pressable style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center", }} onPress={() => {
              setCameraPage(true)
              setStudyPage(false)
              setDictionaryPage(false)
              exitDirection.value = "right"
              tabBarWidth.value = withTiming(0.5 * screenWidth)
              edgeOpacity.value = withTiming(0)
            }}>
              <SFSymbol name="camera.fill" size={18} color="#2F2C2A" style={{ opacity: cameraPage ? 1 : 0.21 }} />
            </Pressable>
            <Pressable style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center", }} onPress={() => {
              toPractice()
            }}>
              <SFSymbol name="rectangle.portrait.on.rectangle.portrait.angled.fill" size={18} color="#2F2C2A" style={{ opacity: studyPage ? 1 : 0.21 }} />
            </Pressable>
            <Pressable style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center", }} onPress={() => {
              setCameraPage(false)
              setStudyPage(false)
              setDictionaryPage(true)
              exitDirection.value = "left"
              tabBarWidth.value = withTiming(0.85 * screenWidth)
              edgeOpacity.value = withTiming(1)
            }}>
              <SFSymbol name="character.book.closed.fill" size={18} color="#2F2C2A" style={{ opacity: dictionaryPage ? 1 : 0.21 }} />
            </Pressable>
          </View>


          {!cameraPage
            ?

            // <Animated.View key={"rightone"} style={{ opacity: edgeOpacity }}>
            //   <Pressable style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center", }} onPress={() => setSettingsPage(true)}>
            //     <SFSymbol name="person.crop.circle" size={25} color="#2F2C2A" />
            //   </Pressable>
            // </Animated.View>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Animated.View key={"rightone"} style={{ opacity: edgeOpacity }}>
                  <Pressable style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center", }}>
                    <SFSymbol name="person.crop.circle" size={25} color="#2F2C2A" />
                  </Pressable>
                </Animated.View>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Label />
                <DropdownMenu.Item key="settings" onSelect={() => setSettingsPage(true)}>
                  <DropdownMenu.ItemTitle>{translations.settings[userLanguage]}</DropdownMenu.ItemTitle>
                  <DropdownMenu.ItemIcon ios={{
                    name: 'gear',
                    pointSize: 15,
                    weight: 'semibold',
                    scale: 'medium',
                  }} />
                </DropdownMenu.Item>
                <DropdownMenu.Item key="log-out" onSelect={() => logOut()}>
                  <DropdownMenu.ItemTitle>{translations.log_out[userLanguage]}</DropdownMenu.ItemTitle>
                  <DropdownMenu.ItemIcon ios={{
                    name: 'rectangle.portrait.and.arrow.right',
                    pointSize: 15,
                    weight: 'semibold',
                    scale: 'medium',
                  }} />
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>

            : null
          }

        </Animated.View>


        {cameraPage &&
          // <Animated.View entering={exitDirection.value ? SlideInLeft : null} exiting={SlideOutLeft} style={{ flex: 1 }}
          // onTouchStart={e => this.touchX = e.nativeEvent.pageX}
          // onTouchEnd={e => {
          //   if (this.touchX - e.nativeEvent.pageX > 150)
          //     toPractice()
          // }}
          // >
          <Animated.View entering={exitDirection.value ? SlideInLeft : null} exiting={SlideOutLeft} style={{ flex: 1 }}>
            <CameraPage language={userLanguage} translations={translations} terms={words} toDictionaryPage={toDictionaryPage} wordSpeed={wordSpeed}/>
          </Animated.View>
        }
        {studyPage &&
          // <Animated.View entering={CustomEnteringAnimation} exiting={CustomExitingAnimation} style={{ flex: 1 }} 
          // onTouchStart={e => this.touchX = e.nativeEvent.pageX}
          // onTouchEnd={e => {
          //   if (this.touchX - e.nativeEvent.pageX > 150) {
          //     setCameraPage(false)
          //     setStudyPage(false)
          //     setDictionaryPage(true)
          //     exitDirection.value = "left"
          //     tabBarWidth.value = withTiming(0.85 * screenWidth)
          //     edgeOpacity.value = withTiming(1)
          //   } else if (this.touchX - e.nativeEvent.pageX < -150) {
          //     setCameraPage(true)
          //     setStudyPage(false)
          //     setDictionaryPage(false)
          //     exitDirection.value = "right"
          //     tabBarWidth.value = withTiming(0.5 * screenWidth)
          //     edgeOpacity.value = withTiming(0)
          //   }}}>
          <Animated.View entering={CustomEnteringAnimation} exiting={CustomExitingAnimation} style={{ flex: 1 }}>
            <StudyPage language={userLanguage} stars={stars} translations={translations} termsPerSession={termsPerSession} />
          </Animated.View>
        }
        {dictionaryPage &&
          // <Animated.View entering={SlideInRight} exiting={SlideOutRight} style={{ flex: 1 }}
        
          // onTouchStart={e => this.touchX = e.nativeEvent.pageX}
          // onTouchEnd={e => {
          //   console.log(this.touchX - e.nativeEvent.pageX)
          //   if (this.touchX - e.nativeEvent.pageX < -150) {
          //     toPractice()
          //   }}}>
          <Animated.View entering={SlideInRight} exiting={SlideOutRight} style={{flex: 1}}>
            <Dictionary language={userLanguage} translations={translations} terms={words} wordSpeed={wordSpeed} />
          </Animated.View>
        }

        {/* <BottomSheet
          ref={bottomSheetRef}
          snapPoints={["100%"]}
          enablePanDownToClose
        >
          <BottomSheetView>

          </BottomSheetView>
        </BottomSheet> */}
      </View>
    )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    position: "absolute",
    zIndex: 100,
    top: screenHeight * 0.07,
    alignSelf: "center",
    flexDirection: "row",
    borderRadius: 60,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 2,
    shadowColor: "black",
    shadowOpacity: 0.2,

  },
  tabBarIcons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

  }
})