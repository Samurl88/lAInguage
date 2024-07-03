import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, ScrollView, Dimensions, TextInput, Pressable, FlatList, SafeAreaView, } from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';


const screenWidth = Dimensions.get("screen").width
const screenHeight = Dimensions.get("screen").height
const stuff = "";
const errors = {
    "auth/invalid-email": "Please enter a valid email.",
    "auth/email-already-in-use": "This email is already associated with an account.",
    "auth/weak-password": "Your password must include at least 6 characters.",
    "auth/user-not-found": "Your email or password is incorrect.",
    "auth/wrong-password": "Your email or password is incorrect.",
    "auth/invalid-credential": "Your email or password is incorrect."
}

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
    "email": {
        "spanish": "correo electrónico",
        "chinese": "电子邮件",
        "tagalog": "email",
        "vietnamese": "email",
        "arabic": "البريد الإلكتروني",
        "french": "email",
        "korean": "이메일",
        "russian": "электронная почта",
        "portuguese": "e-mail",
        "hindi": "ईमेल"
      },
      "password": {
        "spanish": "contraseña",
        "chinese": "密码",
        "tagalog": "password",
        "vietnamese": "mật khẩu",
        "arabic": "كلمة المرور",
        "french": "mot de passe",
        "korean": "비밀번호",
        "russian": "пароль",
        "portuguese": "senha",
        "hindi": "पासवर्ड"
      },
      "create_account": {
        "spanish": "crear cuenta",
        "chinese": "创建账户",
        "tagalog": "gumawa ng account",
        "vietnamese": "tạo tài khoản",
        "arabic": "إنشاء حساب",
        "french": "créer un compte",
        "korean": "계정 생성",
        "russian": "создать аккаунт",
        "portuguese": "criar conta",
        "hindi": "खाता बनाएं"
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
    },
    "sign_up": {
        "spanish": "registrarse",
    "chinese": "注册",
    "tagalog": "mag-sign up",
    "vietnamese": "đăng ký",
    "arabic": "سجل",
    "french": "s'inscrire",
    "korean": "가입하기",
    "russian": "зарегистрироваться",
    "portuguese": "inscrever-se",
    "hindi": "साइन अप करें"
    }
  }

const data = [
    { "language": "english", "emoji": "🇺🇸" },
    { "language": "spanish", "emoji": "🇪🇸" },
    { "language": "chinese", "emoji": "🇨🇳" },
    { "language": "tagalog", "emoji": "🇵🇭" },
    { "language": "vietnamese", "emoji": "🇻🇳" },
    { "language": "arabic", "emoji": "🇸🇦" },
    { "language": "french", "emoji": "🇫🇷" },
    { "language": "korean", "emoji": "🇰🇷" },
    { "language": "russian", "emoji": "🇷🇺" },
    { "language": "portuguese", "emoji": "🇵🇹" },
    { "language": "hindi", "emoji": "🇮🇳" },
]

export default function SignUpScreen() {



    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [signUp, setSignUp] = useState(true)

    const [chosenLanguage, setChosenLanguage] = useState("english")

    async function register() {
        setLoading(true);
        auth()
        .createUserWithEmailAndPassword(email, password)
        .then(() => {
            let uid = auth().currentUser.uid
            database()
            .ref(`/${uid}/profile`)
            .update({
                language: chosenLanguage,
                stars: 0
            })
            
        })
        .catch(error => {
            setError(errors[error.code] ? errors[error.code] : "Something went wrong!");
            console.log(error)
        })
    }

    async function login() {
        setLoading(true);
        auth()
        .signInWithEmailAndPassword(email, password)
        .catch(error => {
            setError(errors[error.code] ? errors[error.code] : "Something went wrong!");
            console.log(error)
        })
    }



    function LanguageIcon({ emoji, language}) {
        return (
            <Pressable onPress={() => setChosenLanguage(language)} style={{backgroundColor: "rgba(118, 118, 128, 0.12)", height: 60, width: 60, justifyContent: "center", alignItems: "center", borderRadius: 30, borderWidth: chosenLanguage === language ? 2 : 0 }}>
                <Text style={{fontSize: 40,  }}>{emoji}</Text>
            </Pressable>
        )
    }

    if (signUp)
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F0E7", }}>
            <View>
                <FlatList 
                    data={data}
                    renderItem={({item}) => <LanguageIcon language={item.language} emoji={item.emoji} />}
                    horizontal
                    contentContainerStyle={{gap: 15, paddingLeft: 20, paddingRight: 20, paddingTop: 20}}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
            <View style={styles.container}>
                <Text style={styles.title}>{translations.sign_up[chosenLanguage] || "Sign Up" }</Text>
                <View style={{ position: "absolute", top: screenHeight * 0.15, width: "100%" }}>
                    <View style={{ ...styles.inputContainer, borderColor: error ? "#D41111" : "rgba(60, 60, 67, 0.4)" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: error ? "#D41111" : "rgba(60, 60, 67, 0.4)" }}>
                            <View style={{ alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "white", }}>
                                <Text style={styles.inputLabel}>{translations.email[chosenLanguage] || "Email"}</Text>
                            </View>
                            <TextInput value={email} style={styles.input} placeholder='email@example.com' onChangeText={(text) => setEmail(text)} autoCapitalize='none' />
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={{ alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "white", }}>
                                <Text style={styles.inputLabel}>{translations.password[chosenLanguage] || "Password"}</Text>
                            </View>
                            <TextInput value={password} style={styles.input} placeholder={translations.password[chosenLanguage] || "Password"} secureTextEntry={true} onChangeText={(text) => setPassword(text)} autoCapitalize='none' />
                        </View>
                    </View>
                    <Text style={styles.error}>{error}</Text>
                </View>

                {email && password
                    ? <Pressable onPress={async () => { register() }}
                        style={styles.infoButton}>
                        <Text style={styles.infoButtonText}>{translations.create_account[chosenLanguage] || "Create Account"}</Text>
                    </Pressable>
                    : <Pressable style={styles.infoButton}>
                        <Text style={styles.infoButtonDisabledText}>{translations.create_account[chosenLanguage] || "Create Account"}</Text>
                    </Pressable>
                }


            </View>

            <View style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", position: "absolute", top: screenHeight * 0.9, alignSelf: "center" }}>
                <Text style={styles.swapPage}>Already have an account? </Text>
                <Pressable onPress={() => { setSignUp(false) }}><Text style={{ ...styles.swapPage, textDecorationLine: "underline" }}>Log in here!</Text></Pressable>
            </View>
        </SafeAreaView>
    );

    if (!signUp)
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F0E7", }}>
                <View style={styles.container}>
                    {/* <Pressable onPress={() => { navigation.goBack() }} style={{ position: "absolute", left: 20 }}>
                        <ArrowLeft2 color="#000" size={32} />
                    </Pressable> */}
                    <Text style={styles.title}>Login</Text>
    
                    <View style={{ position: "absolute", top: screenHeight * 0.15, width: "100%" }}>
                        <View style={{ ...styles.inputContainer, borderColor: error ? "#D41111" : "rgba(60, 60, 67, 0.4)" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: error ? "#D41111" : "rgba(60, 60, 67, 0.4)" }}>
                                <View style={{ alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "white", }}>
                                    <Text style={styles.inputLabel}>Email</Text>
                                </View>
                                <TextInput value={email} style={styles.input} placeholder='email@example.com' onChangeText={(text) => setEmail(text)} autoCapitalize='none' />
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <View style={{ alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "white", }}>
                                    <Text style={styles.inputLabel}>Password</Text>
                                </View>
                                <TextInput value={password} style={styles.input} placeholder='password' secureTextEntry={true} onChangeText={(text) => setPassword(text)} autoCapitalize='none' />
                            </View>
                        </View>
                        <Text style={styles.error}>{error}</Text>
                    </View>
    
                    {email && password
                        ? <Pressable onPress={async () => { login() }}
                            style={styles.infoButton}>
                            <Text style={styles.infoButtonText}>Sign in!</Text>
                        </Pressable>
                        : <Pressable style={styles.infoButton}>
                            <Text style={styles.infoButtonDisabledText}>Sign in!</Text>
                        </Pressable>
                    }
    
    
                </View>
    
                <View style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", position: "absolute", top: screenHeight * 0.9, alignSelf: "center" }}>
                    <Text style={styles.swapPage}>No account? </Text>
                    <Pressable onPress={() => { setSignUp(true) }}><Text style={{ ...styles.swapPage, textDecorationLine: "underline" }}>Create an account!</Text></Pressable>
                </View>
            </SafeAreaView>
        );
}

const styles = StyleSheet.create({
    container: {
        padding: 50,
        flex: 1,
        alignItems: "center"
    },

    background: {
        padding: 50,
    },
    title: {
        fontSize: 50,
        alignSelf: "center",
        fontFamily: "NewYorkLarge-Regular",
        position: "absolute",
        top: screenHeight * 0.05
    },
    inputContainer: {
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        width: "100%",
    },
    input: {
        fontSize: 15,
        flex: 1,
        backgroundColor: "white",
        height: 50,
        fontFamily: "SFPro-Regular",
    },
    inputLabel: {
        fontFamily: "SFPro-Regular",
        width: screenWidth * 0.23,
        paddingLeft: 15
    },
    infoTitle: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 50,
        position: "absolute",

    },
    infoText: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 22,
        position: "absolute",
        top: screenHeight * 0.45
    },
    infoButton: {
        backgroundColor: "#77BEE9",
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#77BEE9",
        shadowOpacity: 0.5,
        shadowRadius: 10,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        alignSelf: "center",
        zIndex: 100,
        top: screenHeight * 0.31,
        position: "absolute",

    },
    infoButtonText: {
        fontFamily: "SFPro-Regular",
        textAlign: "center",
        fontSize: 20,
    },
    infoButtonDisabledText: {
        fontFamily: "SFPro-Regular",
        textAlign: "center",
        fontSize: 20,
        color: "rgba(0, 0, 0, 0.4)"
    },
    thirdPartyButtonContainer: {
        top: screenHeight * 0.5,
        position: "absolute",
        flexDirection: "column",
        gap: 20,
        alignItems: "center",
        justifyContent: "center",
        width: 300
    },
    iconButton: {
        padding: 10,
        borderRadius: 15,
        borderWidth: 1
    },
    error: {
        color: "#D41111",
        alignSelf: "center",
        marginTop: 10,
        textAlign: "center"
    },
    swapPage: {
        fontFamily: "SF-Pro",
        fontSize: 15
    },
    appleButton: {
        width: "100%",
        height: 50
    }

});








// import { View, Text, SafeAreaView, Pressable, } from 'react-native'
// import React, {useState, useEffect} from 'react'
// import auth from '@react-native-firebase/auth';


// export default function SignUp() {
  
//   const [email, setEmail] = useState("teddyffdvssfrrbu@gmail.com");
//   const [password, setPassword] = useState("password");

//   function signUp(email, password) {
    // auth()
    // // .createUserWithEmailAndPassword(email, password)
//     .signInWithEmailAndPassword(email, password)
//     .then(() => {
//       console.log('User account created & signed in!');
//     })
//     .catch(error => {
//       if (error.code === 'auth/email-already-in-use') {
//         console.log('That email address is already in use!');
//       }
  
//       if (error.code === 'auth/invalid-email') {
//         console.log('That email address is invalid!');
//       }
  
//       console.error(error);
//     });
//   }


//   return (
//     <SafeAreaView>
//       <Text>SignUp</Text>
//       <Pressable onPress={() => signUp(email, password)}>
//         <Text>
//           Sign Up!!!
//         </Text>
//       </Pressable>
//     </SafeAreaView>
//   )
// }