import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const BASE_URL = 'http://localhost:8080';

export default function ChildLoginScreen() {
  const [childId, setChildId] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    // async 추가
    if (!childId) {
      Alert.alert('알림', '아이디를 입력해주세요.');
      return;
    }

    try {
      // ✅ 1. POST /child/login API 호출 (Postman 명세)
      const response = await fetch(`${BASE_URL}/child/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: childId }), // Postman 명세에 따라 userId 사용
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ 2. 로그인 성공 시 아이디 저장 키 통일
        await AsyncStorage.setItem('CHILD_USER_ID', childId);

        Alert.alert('로그인 성공', data.message || '로그인이 완료되었습니다.');
        router.push('/child/child-home');
      } else {
        Alert.alert(
          '로그인 실패',
          data.message || '아이디가 올바르지 않습니다.'
        );
      }
    } catch (error) {
      Alert.alert('에러', '서버 연결에 실패했습니다.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        <Text style={styles.logoHighlight}>M</Text>
        <Text style={styles.logoLight}>y</Text>
        <Text style={styles.logoHighlight}>M</Text>
        <Text style={styles.logoLight}>ind</Text>
        <Text style={styles.logoHighlight}>M</Text>
        <Text style={styles.logoLight}>ate</Text>
      </Text>
      <View style={styles.labelBox}>
        <Text style={styles.labelText}>자녀</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          placeholder="아이디"
          style={styles.input}
          placeholderTextColor="#aaa"
          value={childId}
          onChangeText={setChildId}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 36,
    color: 'orange',
    fontFamily: 'Jua',
    marginBottom: 30,
  },
  logoHighlight: {
    color: '#FF9D00', // 진한 주황
  },
  logoLight: {
    color: '#FFC36C', // 밝은 주황
  },
  labelBox: {
    backgroundColor: '#fde2cf',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
    marginLeft: 40,
    alignSelf: 'flex-start',
  },
  labelText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#444',
  },
  form: {
    backgroundColor: '#fdecd7',
    padding: 20,
    borderRadius: 15,
    width: '80%',
    gap: 10,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff8f0',
    padding: 14,
    borderRadius: 10,
    fontFamily: 'Jua',
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#ffc58b',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#333',
  },
});
