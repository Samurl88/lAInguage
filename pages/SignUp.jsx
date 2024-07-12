import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, ScrollView, Dimensions, TextInput, Pressable, FlatList, SafeAreaView, } from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { SFSymbol } from 'react-native-sfsymbols';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const dayjs = require('dayjs')

const screenWidth = Dimensions.get("screen").width
const screenHeight = Dimensions.get("screen").height


const translations = {
    "please_enter_a_valid_email": {
        "spanish": "Por favor, introduzca un correo electrónico válido.",
        "chinese": "请输入有效的电子邮件。",
        "tagalog": "Mangyaring ipasok ang isang wastong email.",
        "vietnamese": "Vui lòng nhập một email hợp lệ.",
        "arabic": "الرجاء إدخال بريد إلكتروني صحيح.",
        "french": "Veuillez entrer un email valide.",
        "korean": "유효한 이메일을 입력하세요.",
        "russian": "Пожалуйста, введите действительный адрес электронной почты.",
        "portuguese": "Por favor, insira um email válido.",
        "hindi": "कृपया एक वैध ईमेल दर्ज करें।",
        "english": "Please enter a valid email."
      },
      "this_email_is_already_associated_with_an_account": {
        "spanish": "Este correo electrónico ya está asociado con una cuenta.",
        "chinese": "此电子邮件已与一个帐户关联。",
        "tagalog": "Ang email na ito ay nauugnay na sa isang account.",
        "vietnamese": "Email này đã được liên kết với một tài khoản.",
        "arabic": "هذا البريد الإلكتروني مرتبط بالفعل بحساب.",
        "french": "Cet email est déjà associé à un compte.",
        "korean": "이 이메일은 이미 계정과 연결되어 있습니다.",
        "russian": "Этот адрес электронной почты уже связан с учетной записью.",
        "portuguese": "Este email já está associado a uma conta.",
        "hindi": "यह ईमेल पहले से ही एक खाते से जुड़ा हुआ है।",
        "english": "This email is already associated with an account."
      },
      "your_password_must_include_at_least_6_characters": {
        "spanish": "Su contraseña debe incluir al menos 6 caracteres.",
        "chinese": "您的密码必须包含至少6个字符。",
        "tagalog": "Ang iyong password ay dapat maglaman ng hindi bababa sa 6 na character.",
        "vietnamese": "Mật khẩu của bạn phải bao gồm ít nhất 6 ký tự.",
        "arabic": "يجب أن تحتوي كلمة مرورك على 6 أحرف على الأقل.",
        "french": "Votre mot de passe doit contenir au moins 6 caractères.",
        "korean": "비밀번호는 최소 6자 이상이어야 합니다.",
        "russian": "Ваш пароль должен содержать не менее 6 символов.",
        "portuguese": "Sua senha deve incluir pelo menos 6 caracteres.",
        "hindi": "आपका पासवर्ड कम से कम 6 अक्षर शामिल होना चाहिए।",
        "english": "Your password must include at least 6 characters."
      },
      "your_email_or_password_is_incorrect": {
        "spanish": "Su correo electrónico o contraseña es incorrecto.",
        "chinese": "您的电子邮件或密码不正确。",
        "tagalog": "Mali ang iyong email o password.",
        "vietnamese": "Email hoặc mật khẩu của bạn không chính xác.",
        "arabic": "بريدك الإلكتروني أو كلمة المرور غير صحيحة.",
        "french": "Votre email ou mot de passe est incorrect.",
        "korean": "이메일 또는 비밀번호가 올바르지 않습니다.",
        "russian": "Ваш электронный адрес или пароль неправильны.",
        "portuguese": "Seu email ou senha está incorreto.",
        "hindi": "आपका ईमेल या पासवर्ड गलत है।",
        "english": "Your email or password is incorrect."
      },
      "email": {
        "spanish": "Correo Electrónico",
        "chinese": "电子邮件",
        "tagalog": "Email",
        "vietnamese": "Email",
        "arabic": "البريد الإلكتروني",
        "french": "Email",
        "korean": "이메일",
        "russian": "Эл. адрес",
        "portuguese": "Email",
        "hindi": "ईमेल",
        "english": "Email"
      },
      "password": {
        "spanish": "Contraseña",
        "chinese": "密码",
        "tagalog": "Password",
        "vietnamese": "Mật Khẩu",
        "arabic": "كلمة المرور",
        "french": "Mot De Passe",
        "korean": "비밀번호",
        "russian": "Пароль",
        "portuguese": "Senha",
        "hindi": "पासवर्ड",
        "english": "Password",
      },
      "sign_up": {
        "spanish": "Regístrate",
        "chinese": "注册",
        "tagalog": "Mag-Sign Up",
        "vietnamese": "Đăng Ký",
        "arabic": "اشترك",
        "french": "Inscrivez-Vous",
        "korean": "가입하기",
        "russian": "Зарегистрироваться",
        "portuguese": "Inscrever-Se",
        "hindi": "साइन अप करें",
        "english": "Sign Up"
      },
      "log_in": {
        "spanish": "Iniciar Sesión",
        "chinese": "登录",
        "tagalog": "Mag-Log In",
        "vietnamese": "Đăng Nhập",
        "arabic": "تسجيل الدخول",
        "french": "Se Connecter",
        "korean": "로그인",
        "russian": "Войти",
        "portuguese": "Entrar",
        "hindi": "लॉग इन करें",
        "english": "Log In"
      },
      "create_an_account": {
        "spanish": "Crea una cuenta!",
        "chinese": "创建一个账户！",
        "tagalog": "Lumikha ng isang account!",
        "vietnamese": "Tạo một tài khoản!",
        "arabic": "أنشئ حساباً!",
        "french": "Créez un compte!",
        "korean": "계정을 생성하세요!",
        "russian": "Создайте аккаунт!",
        "portuguese": "Crie uma conta!",
        "hindi": "एक खाता बनाएँ!",
        "english": "Create an account!"
      },
      "no_account": {
    "spanish": "¿No tienes cuenta?",
    "chinese": "没有账户吗？",
    "tagalog": "Walang account?",
    "vietnamese": "Không có tài khoản?",
    "arabic": "لا حساب؟",
    "french": "Pas de compte ?",
    "korean": "계정이 없나요?",
    "russian": "Нет аккаунта?",
    "portuguese": "Não tem conta?",
    "hindi": "कोई खाता नहीं?",
    "english": "No account?"
  },
  "sign_in_exclamation": {
    "spanish": "¡Inicia sesión!",
    "chinese": "登录！",
    "tagalog": "Mag-sign in!",
    "vietnamese": "Đăng nhập!",
    "arabic": "سجّل الدخول!",
    "french": "Connectez-vous !",
    "korean": "로그인하세요!",
    "russian": "Войти!",
    "portuguese": "Faça login!",
    "hindi": "साइन इन करें!",
    "english": "Sign in!"
  },
  "already_have_an_account": {
    "spanish": "¿Ya tienes una cuenta?",
    "chinese": "已经有账户了？",
    "tagalog": "May account na?",
    "vietnamese": "Đã có tài khoản?",
    "arabic": "هل لديك حساب؟",
    "french": "Vous avez déjà un compte ?",
    "korean": "이미 계정이 있습니까?",
    "russian": "Уже есть аккаунт?",
    "portuguese": "Já tem uma conta?",
    "hindi": "पहले से ही एक खाता है?",
    "english": "Already have an account?"
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

export default function SignUpScreen({ route, navigation }) {
    const { chosenLanguage } = route.params;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [signUp, setSignUp] = useState(true)

    const [change, setChange] = useState(false)

    const errors = {
        "auth/invalid-email": translations.please_enter_a_valid_email[chosenLanguage],
        "auth/email-already-in-use": translations.this_email_is_already_associated_with_an_account[chosenLanguage],
        "auth/weak-password": translations.your_password_must_include_at_least_6_characters[chosenLanguage],
        "auth/user-not-found": translations.your_email_or_password_is_incorrect[chosenLanguage],
        "auth/wrong-password": translations.your_email_or_password_is_incorrect[chosenLanguage],
        "auth/invalid-credential": translations.your_email_or_password_is_incorrect[chosenLanguage]
    }

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
                stars: 0,
                lastCompleted: JSON.stringify(dayjs().year(2000)),
                notifications: true,
                termsPerSession: 10,
                wordSpeed: 1
            })
        })
        .catch(error => {
            console.log(errors[error.code])

            setError(errors[error.code] ? errors[error.code] : "Something went wrong!");
            // console.log(error.code)
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

    if (signUp)
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F0E7", }}>
            <View style={styles.container}>
                <Pressable onPress={() => { navigation.goBack() }} style={{ position: "absolute", left: 20,  width: 24, height: 24, justifyContent: "center", alignItems: 'center' }}>
                    <SFSymbol name="chevron.left" color="#000" size={24} />
                </Pressable>
                <Animated.Text key="signup-title" entering={change && FadeIn.duration(250).delay(250)} exiting={FadeOut.duration(250)} style={styles.title}>{translations.sign_up[chosenLanguage] }</Animated.Text>
                <View style={{ position: "absolute", top: screenHeight * 0.15, width: "100%" }}>
                    <View style={{ ...styles.inputContainer, borderColor: error ? "#D41111" : "rgba(60, 60, 67, 0.4)" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: error ? "#D41111" : "rgba(60, 60, 67, 0.4)" }}>
                            <View style={{ alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "white", }}>
                                <Text style={styles.inputLabel}>{translations.email[chosenLanguage]}</Text>
                            </View>
                            <TextInput value={email} style={styles.input} placeholder='email@example.com' onChangeText={(text) => setEmail(text)} autoCapitalize='none' />
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={{ alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "white", }}>
                                <Text style={styles.inputLabel}>{translations.password[chosenLanguage]}</Text>
                            </View>
                            <TextInput value={password} style={styles.input} placeholder={translations.password[chosenLanguage]} secureTextEntry={true} onChangeText={(text) => setPassword(text)} autoCapitalize='none' />
                        </View>
                    </View>
                    <Text style={styles.error}>{error}</Text>
                </View>

                <Animated.View key="signup-btn" entering={change && FadeIn.duration(250).delay(250)} exiting={FadeOut.duration(250)} style={{ top: screenHeight * 0.35, position: "absolute",}}>
                    {email && password
                        ? <Pressable onPress={async () => { register() }}
                            style={styles.infoButton}>
                            <Text style={styles.infoButtonText}>{translations.create_an_account[chosenLanguage]}</Text>
                        </Pressable>
                        : <Pressable style={styles.infoButton}>
                            <Text style={styles.infoButtonDisabledText}>{translations.create_an_account[chosenLanguage]}</Text>
                        </Pressable>
                    }
                </Animated.View>


            </View>

            <Animated.View key="change-sign-in" entering={change && FadeIn.duration(250).delay(250)} exiting={FadeOut.duration(250)} style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", position: "absolute", top: screenHeight * 0.9, alignSelf: "center" }}>
                <Text style={styles.swapPage}>{translations.already_have_an_account[chosenLanguage]} </Text>
                <Pressable onPress={() => { 
                    setSignUp(false) 
                    setChange(true)
                    }}><Text style={{ ...styles.swapPage, textDecorationLine: "underline" }}>{translations.log_in[chosenLanguage]}!</Text></Pressable>
            </Animated.View>
        </SafeAreaView>
    );

    if (!signUp)
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F0E7", }}>
                <View style={styles.container}>
                    <Pressable onPress={() => { navigation.goBack() }} style={{ position: "absolute", left: 20,  width: 24, height: 24, justifyContent: "center", alignItems: 'center' }}>
                        <SFSymbol name="chevron.left" color="#000" size={24} />
                    </Pressable>
                    <Animated.Text key="login-title" entering={FadeIn.duration(250).delay(250)} exiting={FadeOut.duration(250)} style={styles.title}>{translations.log_in[chosenLanguage]}</Animated.Text>
    
                    <View style={{ position: "absolute", top: screenHeight * 0.15, width: "100%" }}>
                        <View style={{ ...styles.inputContainer, borderColor: error ? "#D41111" : "rgba(60, 60, 67, 0.4)" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: error ? "#D41111" : "rgba(60, 60, 67, 0.4)" }}>
                                <View style={{ alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "white", }}>
                                    <Text style={styles.inputLabel}>{translations.email[chosenLanguage]}</Text>
                                </View>
                                <TextInput value={email} style={styles.input} placeholder='email@example.com' onChangeText={(text) => setEmail(text)} autoCapitalize='none' />
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <View style={{ alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "white", }}>
                                    <Text style={styles.inputLabel}>{translations.password[chosenLanguage]}</Text>
                                </View>
                                <TextInput value={password} style={styles.input} placeholder={translations.password[chosenLanguage]} secureTextEntry={true} onChangeText={(text) => setPassword(text)} autoCapitalize='none' />
                            </View>
                        </View>
                        <Text style={styles.error}>{error}</Text>
                    </View>
    
                    <Animated.View key="login-btn" entering={FadeIn.duration(250).delay(250)} exiting={FadeOut.duration(250)} style={{ top: screenHeight * 0.35, position: "absolute",}}>
                        {email && password
                            ? <Pressable onPress={async () => { login() }}
                                style={styles.infoButton}>
                                <Text style={styles.infoButtonText}>{translations.sign_in_exclamation[chosenLanguage]}</Text>
                            </Pressable>
                            : <Pressable style={styles.infoButton}>
                                <Text style={styles.infoButtonDisabledText}>{translations.sign_in_exclamation[chosenLanguage]}</Text>
                            </Pressable>
                        }
                    </Animated.View>
    
    
                </View>
    
                <Animated.View key="change-sign-up" entering={FadeIn.duration(250).delay(250)} exiting={FadeOut.duration(250)} style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", position: "absolute", top: screenHeight * 0.9, alignSelf: "center" }}>
                    <Text style={styles.swapPage}>{translations.no_account[chosenLanguage]} </Text>
                    <Pressable onPress={() => { setSignUp(true) }}><Text style={{ ...styles.swapPage, textDecorationLine: "underline" }}>{translations.create_an_account[chosenLanguage]}</Text></Pressable>
                </Animated.View>
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
        fontSize: 45,
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



