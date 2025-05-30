import React, { useEffect, useRef, useState } from 'react';
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
  const [timer, setTimer] = useState(0);
  const [authCode, setAuthCode] = useState('');
  const [authVerified, setAuthVerified] = useState(false);

  const [userId, setUserId] = useState('');
  const [idChecked, setIdChecked] = useState(false);
  const [idAvailable, setIdAvailable] = useState(false);

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [sendStatus, setSendStatus] = useState('');
  
  // 타이머 시작 함수
  const startTimer = () => {
    setTimer(180); // 3분 = 180초
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setEmailSent(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 이메일 인증 코드 보내기 버튼 클릭
  const sendAuthCode = () => {
    if (!email.includes('@')) {
      Alert.alert('알림', '유효한 이메일을 입력하세요.');
      return;
    }
    if (!emailSent) {
      setSendStatus('전송 완료');
    } else {
      setSendStatus('재전송 완료');
      clearInterval(timerRef.current!); // 타이머 초기화
    }
    setEmailSent(true);
    setAuthVerified(false);
    startTimer();
    // 이메일 인증 코드 전송 API 호출
  };

  // 인증 코드 확인 버튼 클릭
  const verifyAuthCode = () => {
    if (authCode === '123456') {
      setAuthVerified(true);
      clearInterval(timerRef.current!);
      setTimer(0);
      Alert.alert('인증 완료', '이메일 인증이 완료되었습니다.');
    } else {
      Alert.alert('오류', '인증 코드가 올바르지 않습니다.');
    }
  };

  // 아이디 중복 체크 (더미 함수)
  const checkIdDuplication = () => {
    if (userId.length < 4) {
      Alert.alert('알림', '아이디는 4자 이상이어야 합니다.');
      return;
    }
    // 실제 중복 체크 API 호출
    if (userId === 'takenId') {
      setIdAvailable(false);
    } else {
      setIdAvailable(true);
    }
    setIdChecked(true);
  };

  // 비밀번호 일치 여부 체크
  useEffect(() => {
    setPasswordMatch(password === passwordConfirm);
  }, [password, passwordConfirm]);

  // 가입하기 버튼 활성화 조건
  const canSignUp =
    authVerified &&
    idChecked &&
    idAvailable &&
    passwordMatch &&
    password.length > 0;

  // 타이머 분:초 표시
  const formatTimer = () => {
    const min = Math.floor(timer / 60);
    const sec = timer % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

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

          {/* 이메일 생성 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>이메일 생성</Text>
            <TextInput
              placeholder="이메일 입력"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              editable={!emailSent}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#aaa"
            />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={[styles.button]}
                onPress={sendAuthCode}
              >
                <Text style={styles.buttonText}>인증 코드 보내기</Text>
              </TouchableOpacity>
              {sendStatus !== '' && (
                <Text style={{ marginLeft: 10, fontFamily: 'Jua', color: 'red' }}>
                  {sendStatus}
                </Text>
              )}
            </View>
          </View>

          {/* 이메일 인증 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>이메일 인증</Text>
            <TextInput
              placeholder="인증 코드 입력"
              style={styles.input}
              value={authCode}
              onChangeText={setAuthCode}
              editable={emailSent && !authVerified && timer > 0}
              keyboardType="number-pad"
              placeholderTextColor="#aaa"
            />
            <View style={styles.row}>
              <TouchableOpacity
                style={[
                  styles.button,
                  (!emailSent || authVerified || timer === 0) && styles.buttonDisabled,
                ]}
                onPress={verifyAuthCode}
                disabled={!emailSent || authVerified || timer === 0}
              >
                <Text style={styles.buttonText}>인증</Text>
              </TouchableOpacity>
              <Text
                style={[
                  styles.timerText,
                  authVerified && { color: 'red' },
                ]}
              >
                {authVerified ? '인증 완료' : (emailSent && timer > 0 ? formatTimer() : '')}
              </Text>
            </View>
          </View>

          {/* 아이디 생성 */}
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

          {/* 비밀번호 생성 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>비밀번호 생성</Text>
            <TextInput
              placeholder="비밀번호"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#aaa"
            />
            <TextInput
              placeholder="비밀번호 재입력"
              style={styles.input}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry
              placeholderTextColor="#aaa"
            />
            {!passwordMatch && (
              <Text style={{ color: 'red', marginLeft: 10, marginTop: 10, fontFamily: 'Jua' }}>
                비밀번호가 일치하지 않습니다.
              </Text>
            )}
            {passwordMatch && password.length > 0 && (
              <Text style={{ color: 'green', marginLeft: 10, marginTop: 10, fontFamily: 'Jua' }}>동일함</Text>
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
});