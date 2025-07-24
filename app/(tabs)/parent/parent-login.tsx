import { FontAwesome } from '@expo/vector-icons';
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

export default function ParentLoginScreen() {
  const router = useRouter();
  const [account, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8080/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: account,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('로그인 성공', data.message || '로그인이 완료되었습니다.');
        router.push('/parent/parent-home');
      } else {
        Alert.alert('로그인 실패', data.message || '아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      Alert.alert('에러 발생', '서버에 연결할 수 없습니다.');
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
        <Text style={styles.labelText}>부모</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="아이디"
            style={styles.input}
            placeholderTextColor="#aaa"
            value={account}
            onChangeText={setUserId}
          />
        </View>

        <View style={styles.inputRow}>
          <TextInput
            placeholder="비밀번호"
            style={[styles.input, { flex: 1 }]}
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={24} color="#999" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => router.push('/parent/parentSignUp')}
      >
        <Text style={styles.buttonText}>가입하기</Text>
      </TouchableOpacity>
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
    color: '#FF9D00',
  },
  logoLight: {
    color: '#FFC36C',
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f0',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  input: {
    fontFamily: 'Jua',
    fontSize: 16,
    paddingVertical: 14,
    flex: 1,
  },
  eyeIcon: {
    padding: 5,
  },
  conditionBox: {
    marginTop: 4,
    marginBottom: 10,
  },
  conditionText: {
    fontFamily: 'Jua',
    fontSize: 13,
  },
  ok: {
    color: 'green',
  },
  no: {
    color: 'red',
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
  joinButton: {
    marginTop: 10,
    width: '80%',
    backgroundColor: '#ffc58b',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
});
