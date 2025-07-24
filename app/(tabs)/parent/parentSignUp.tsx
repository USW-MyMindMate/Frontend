import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ParentSignUp() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);

  const [userId, setUserId] = useState('');
  const [idChecked, setIdChecked] = useState(false);
  const [idAvailable, setIdAvailable] = useState(false);

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);

  const [sendStatus, setSendStatus] = useState('');

  const sendAuthCode = async () => {
    if (!email.includes('@')) {
      Alert.alert('알림', '유효한 이메일을 입력하세요.');
      return;
    }

    try {
      await fetch('https://your-api.com/auth/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      setEmailSent(true);
      setAuthVerified(false);
      setSendStatus(emailSent ? '재전송 완료' : '전송 완료');
    } catch (err) {
      Alert.alert('오류', '이메일 전송에 실패했습니다.');
      console.log(err);
    }
  };

  // 이메일 인증 여부 3초마다 확인
  useEffect(() => {
    if (emailSent && !authVerified) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`https://your-api.com/auth/check?email=${email}`);
          const data = await res.json();
          if (data.verified) {
            setAuthVerified(true);
            clearInterval(interval);
          }
        } catch (err) {
          console.log('인증 확인 실패:', err);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [emailSent, authVerified, email]);

  const checkIdDuplication = () => {
    if (userId.length < 4) {
      Alert.alert('알림', '아이디는 4자 이상이어야 합니다.');
      return;
    }
    if (userId === 'takenId') {
      setIdAvailable(false);
    } else {
      setIdAvailable(true);
    }
    setIdChecked(true);
  };

  useEffect(() => {
    setPasswordMatch(password === passwordConfirm);
  }, [password, passwordConfirm]);

  const canSignUp =
    authVerified && idChecked && idAvailable && passwordMatch && password.length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.logo}>
            <Text style={styles.logoHighlight}>M</Text>
            <Text style={styles.logoLight}>y</Text>
            <Text style={styles.logoHighlight}>M</Text>
            <Text style={styles.logoLight}>ind</Text>
            <Text style={styles.logoHighlight}>M</Text>
            <Text style={styles.logoLight}>ate</Text>
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>이메일 생성</Text>
            <TextInput
              placeholder="이메일 입력"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              editable={!authVerified}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#aaa"
            />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={styles.button} onPress={sendAuthCode}>
                <Text style={styles.buttonText}>인증</Text>
              </TouchableOpacity>
              {sendStatus !== '' && (
                <Text style={{ marginLeft: 10, fontFamily: 'Jua', color: 'red' }}>
                  {sendStatus} {authVerified && '인증 완료'}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>아이디 생성</Text>
            <TextInput
              placeholder="아이디"
              style={styles.input}
              value={userId}
              onChangeText={setUserId}
              editable={authVerified}
              autoCapitalize="none"
              placeholderTextColor="#aaa"
            />
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.button, !authVerified && styles.buttonDisabled]}
                onPress={checkIdDuplication}
                disabled={!authVerified}
              >
                <Text style={styles.buttonText}>중복 체크</Text>
              </TouchableOpacity>
              {idChecked && (
                <Text
                  style={{
                    marginLeft: 10,
                    color: idAvailable ? 'green' : 'red',
                    fontFamily: 'Jua',
                  }}
                >
                  {idAvailable ? '중복 없음' : '중복'}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>비밀번호 생성</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                placeholder="비밀번호"
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
                <FontAwesome name={passwordVisible ? 'eye' : 'eye-slash'} size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={{ margin: 10 }}>
              <Text style={{ fontFamily: 'Jua', color: password.length >= 8 ? 'green' : 'red', fontSize: 14 }}>
                8자 이상 {password.length >= 8 ? 'O' : 'X'}
              </Text>
              <Text style={{ fontFamily: 'Jua', color: /\d/.test(password) ? 'green' : 'red', fontSize: 14 }}>
                숫자 포함 {/\d/.test(password) ? 'O' : 'X'}
              </Text>
              <Text style={{ fontFamily: 'Jua', color: /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'green' : 'red', fontSize: 14 }}>
                특수문자 포함 {/[^A-Za-z0-9]/.test(password) ? 'O' : 'X'}
              </Text>
            </View>

            <View style={styles.passwordInputContainer}>
              <TextInput
                placeholder="비밀번호 재입력"
                style={styles.passwordInput}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry={!passwordConfirmVisible}
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity onPress={() => setPasswordConfirmVisible(!passwordConfirmVisible)} style={styles.eyeIcon}>
                <FontAwesome name={passwordConfirmVisible ? 'eye' : 'eye-slash'} size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {!passwordMatch && (
              <Text style={{ color: 'red', marginLeft: 10, marginTop: 10, fontFamily: 'Jua' }}>
                비밀번호가 일치하지 않습니다.
              </Text>
            )}
            {passwordMatch && password.length > 0 && (
              <Text style={{ color: 'green', marginLeft: 10, marginTop: 10, fontFamily: 'Jua' }}>
                동일함
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, !canSignUp && styles.buttonDisabled]}
            disabled={!canSignUp}
            onPress={() => Alert.alert('가입 완료', '회원가입이 완료되었습니다!')}
          >
            <Text style={styles.signUpButtonText}>가입하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  container: {
    width: '80%',
    alignSelf: 'center',
    paddingVertical: 20,
    paddingTop: 80,
  },
  logo: {
    textAlign: 'center',
    fontSize: 36,
    fontFamily: 'Jua',
    marginBottom: 30,
  },
  logoHighlight: {
    color: '#FF9D00',
  },
  logoLight: {
    color: '#FFC36C',
  },
  section: {
    backgroundColor: '#fdecd7',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: 'Jua',
    fontSize: 18,
    marginBottom: 10,
    color: '#444',
  },
  input: {
    backgroundColor: '#fff8f0',
    borderRadius: 10,
    padding: 12,
    fontFamily: 'Jua',
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#ffc58b',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  buttonDisabled: {
    backgroundColor: '#f9d9b5',
  },
  buttonText: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  timerText: {
    marginLeft: 10,
    fontFamily: 'Jua',
    color: '#f16c00',
  },
  signUpButton: {
    backgroundColor: '#ffc58b',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  signUpButtonText: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#333',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f0',
    borderRadius: 10,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontFamily: 'Jua',
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 6,
  },
});
