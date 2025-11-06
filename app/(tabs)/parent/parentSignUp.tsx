import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

const BASE_URL = 'http://localhost:8080'; // 🚨 IP 주소 수정 필요

const INITIAL_TIMER_SECONDS = 180;

export default function ParentSignUp() {
  const router = useRouter();

  // 1. 이메일 인증 관련 상태
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false); // 이메일 전송 시작 여부
  const [authVerified, setAuthVerified] = useState(false); // 이메일 인증 완료 여부
  const [timer, setTimer] = useState(0); // 타이머 초 (180초 시작)
  const [sendStatus, setSendStatus] = useState(''); // 전송 상태 메시지

  // 2. 아이디 관련 상태
  const [userId, setUserId] = useState('');
  const [idChecked, setIdChecked] = useState(false);
  const [idAvailable, setIdAvailable] = useState(false);

  // 3. 비밀번호 관련 상태
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);

  // ----------------------------------------------------
  // 1. 타이머 로직
  // ----------------------------------------------------
  useEffect(() => {
    let interval: number | null = null;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000) as unknown as number;
    } else if (timer === 0 && emailSent && !authVerified) {
      // 타이머 종료 시 (인증 시간 만료)
      if (interval) clearInterval(interval);
      setSendStatus('인증 시간 만료');
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer, emailSent, authVerified]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // ----------------------------------------------------
  // 2. 이메일 인증 메일 전송 로직
  // ----------------------------------------------------
  const sendAuthCode = async () => {
    if (!email.includes('@')) {
      Alert.alert('알림', '유효한 이메일을 입력하세요.');
      return;
    }

    const isResend = emailSent && timer === 0;

    if (timer > 0) {
      Alert.alert(
        '알림',
        `잠시 후 ${formatTime(timer)}초 뒤에 재전송할 수 있습니다.`
      );
      return;
    }

    try {
      const url = isResend
        ? `${BASE_URL}/user/reconfirm-email?email=${email}`
        : `${BASE_URL}/user/confirm-email?email=${email}`;
      const method = isResend ? 'POST' : 'GET';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : { message: response.statusText };

      if (response.ok) {
        setEmailSent(true);
        setTimer(INITIAL_TIMER_SECONDS); // 3분 타이머 시작
        setSendStatus(isResend ? '재전송 완료' : '전송 완료');

        Alert.alert(
          '성공',
          data.message || '인증 메일이 전송되었습니다. 이메일을 확인해 주세요.'
        );
      } else {
        Alert.alert('오류', data.message || '이메일 전송에 실패했습니다.');
        setSendStatus('전송 실패');
      }
    } catch (err) {
      Alert.alert('에러', '서버에 연결할 수 없습니다.');
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // 3. 이메일 인증 확인 로직
  // ----------------------------------------------------
  const verifyAuthCode = async () => {
    if (!emailSent) {
      Alert.alert('알림', '이메일 인증을 먼저 요청해주세요.');
      return;
    }

    try {
      // GET /user/check-verify?email=...
      const response = await fetch(
        `${BASE_URL}/user/check-verify?email=${email}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = await response.json();

      if (response.ok && data.data === true) {
        setAuthVerified(true);
        setSendStatus('인증 완료');
        setTimer(0); // 타이머 중지
        Alert.alert('성공', data.message || '이메일 인증이 완료되었습니다.');
      } else {
        Alert.alert(
          '오류',
          data.message || '이메일 인증에 실패했거나, 인증되지 않았습니다.'
        );
      }
    } catch (err) {
      Alert.alert('에러', '서버에 연결할 수 없습니다.');
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // ✅ 4. 아이디 중복 확인 로직 (GET, Query Parameter 수정)
  // ----------------------------------------------------
  const checkIdDuplication = async () => {
    if (userId.length < 4) {
      Alert.alert('알림', '아이디는 4자 이상이어야 합니다.');
      return;
    }

    if (!email || !email.includes('@')) {
      Alert.alert('알림', '유효한 이메일을 먼저 입력해주세요.');
      return;
    }

    if (!authVerified) {
      Alert.alert('알림', '이메일 인증을 먼저 완료해주세요.');
      return;
    }

    try {
      // 🚨 수정: 아이디와 이메일을 모두 Query Parameter로 전송
      const url = `${BASE_URL}/user/check-account?account=${userId}&email=${email}`;

      const response = await fetch(url, {
        method: 'GET', // GET 유지
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setIdAvailable(true);
        setIdChecked(true);
        Alert.alert('알림', '사용 가능한 아이디입니다.');
      } else {
        const data = await response.json();
        setIdAvailable(false);
        setIdChecked(true);
        Alert.alert('알림', data.message || '이미 사용 중인 아이디입니다.');
      }
    } catch (err) {
      Alert.alert('에러', '서버에 연결할 수 없습니다.');
      console.error(err);
    }
  };

  // 비밀번호 일치 확인 및 ID 변경 시 중복 확인 초기화
  useEffect(() => {
    // ID가 변경되면 중복 확인 상태 초기화
    setIdChecked(false);
    setIdAvailable(false);
    setPasswordMatch(password === passwordConfirm);
  }, [password, passwordConfirm, userId]);

  // ----------------------------------------------------
  // 5. 회원가입 활성화 조건
  // ----------------------------------------------------
  const isPasswordValid =
    password.length >= 8 &&
    /\d/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const canSignUp =
    authVerified &&
    idChecked &&
    idAvailable &&
    passwordMatch &&
    isPasswordValid &&
    email.length > 0 &&
    userId.length > 0 &&
    password.length > 0;

  // ----------------------------------------------------
  // 6. 최종 회원가입 로직
  // ----------------------------------------------------
  const handleSignUp = async () => {
    if (!canSignUp) {
      Alert.alert(
        '알림',
        '모든 필수 항목을 올바르게 입력했는지 확인해 주세요.'
      );
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/user/sign-up-finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: userId,
          email: email,
          password: password,
          passwordConfirm: passwordConfirm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('가입 완료', data.message || '회원가입이 완료되었습니다!');
        router.push('/parent/parent-login');
      } else {
        Alert.alert('오류', data.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      Alert.alert('에러', '서버에 연결할 수 없습니다.');
      console.error(err);
    }
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

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>이메일 생성</Text>
            <TextInput
              placeholder="이메일 입력"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              editable={!emailSent} // 전송 후에는 수정 불가
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#aaa"
            />

            <View style={styles.row}>
              <TouchableOpacity
                style={[
                  styles.button,
                  emailSent && timer > 0 && styles.buttonDisabled,
                ]}
                onPress={sendAuthCode}
                disabled={(emailSent && timer > 0) || authVerified} // 인증 완료 후 비활성화
              >
                <Text style={styles.buttonText}>
                  {emailSent ? '재전송' : '인증 요청'}
                </Text>
              </TouchableOpacity>

              {(emailSent || sendStatus) && !authVerified ? (
                <Text style={styles.timerText}>
                  {timer > 0 ? formatTime(timer) : sendStatus}
                </Text>
              ) : null}
            </View>

            {emailSent && !authVerified ? (
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.button, { marginTop: 10, marginRight: 10 }]}
                  onPress={verifyAuthCode}
                  disabled={timer === 0} // 타이머 만료 시 인증 확인도 비활성화
                >
                  <Text style={styles.buttonText}>인증 확인</Text>
                </TouchableOpacity>

                <Text
                  style={{ marginLeft: 10, fontFamily: 'Jua', color: 'gray' }}
                >
                  메일 확인 후 버튼을 눌러주세요.
                </Text>
              </View>
            ) : null}

            {authVerified ? (
              <Text
                style={{ marginTop: 10, fontFamily: 'Jua', color: 'green' }}
              >
                ✅ 인증 완료
              </Text>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>아이디 생성</Text>
            <TextInput
              placeholder="아이디"
              style={styles.input}
              value={userId}
              onChangeText={setUserId}
              editable={authVerified && !idChecked}
              autoCapitalize="none"
              placeholderTextColor="#aaa"
            />
            <View style={styles.row}>
              <TouchableOpacity
                style={[
                  styles.button,
                  (!authVerified || idChecked || userId.length < 4) &&
                    styles.buttonDisabled, // 아이디 4자 미만 시 비활성화 추가
                ]}
                onPress={checkIdDuplication}
                disabled={!authVerified || idChecked || userId.length < 4}
              >
                <Text style={styles.buttonText}>중복 체크</Text>
              </TouchableOpacity>
              {idChecked ? (
                <Text
                  style={{
                    marginLeft: 10,
                    color: idAvailable ? 'green' : 'red',
                    fontFamily: 'Jua',
                  }}
                >
                  {idAvailable ? '중복 없음' : '중복'}
                </Text>
              ) : null}
              {idChecked ? (
                <Text
                  style={{
                    marginLeft: 10,
                    color: idAvailable ? 'green' : 'red',
                    fontFamily: 'Jua',
                  }}
                >
                  {idAvailable ? '중복 없음' : '중복'}
                </Text>
              ) : null}
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
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.eyeIcon}
              >
                <FontAwesome
                  name={passwordVisible ? 'eye' : 'eye-slash'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            <View style={{ margin: 10 }}>
              <Text
                style={{
                  fontFamily: 'Jua',
                  color: password.length >= 8 ? 'green' : 'red',
                  fontSize: 14,
                }}
              >
                8자 이상 {password.length >= 8 ? 'O' : 'X'}
              </Text>
              <Text
                style={{
                  fontFamily: 'Jua',
                  color: /\d/.test(password) ? 'green' : 'red',
                  fontSize: 14,
                }}
              >
                숫자 포함 {/\d/.test(password) ? 'O' : 'X'}
              </Text>
              <Text
                style={{
                  fontFamily: 'Jua',
                  color: /[!@#$%^&*(),.?":{}|<>]/.test(password)
                    ? 'green'
                    : 'red',
                  fontSize: 14,
                }}
              >
                특수문자 포함{' '}
                {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'O' : 'X'}
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
              <TouchableOpacity
                onPress={() =>
                  setPasswordConfirmVisible(!passwordConfirmVisible)
                }
                style={styles.eyeIcon}
              >
                <FontAwesome
                  name={passwordConfirmVisible ? 'eye' : 'eye-slash'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {!passwordMatch && passwordConfirm.length > 0 ? (
              <Text
                style={{
                  color: 'red',
                  marginLeft: 10,
                  marginTop: 10,
                  fontFamily: 'Jua',
                }}
              >
                비밀번호가 일치하지 않습니다.
              </Text>
            ) : null}
            {passwordMatch &&
            password.length > 0 &&
            passwordConfirm.length > 0 ? (
              <Text
                style={{
                  color: 'green',
                  marginLeft: 10,
                  marginTop: 10,
                  fontFamily: 'Jua',
                }}
              >
                동일함
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, !canSignUp && styles.buttonDisabled]}
            disabled={!canSignUp}
            onPress={handleSignUp}
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
