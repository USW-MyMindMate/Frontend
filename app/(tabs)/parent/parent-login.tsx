import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ParentLoginScreen() {
  const router = useRouter();
  
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
        <TextInput 
          placeholder="아이디" 
          style={[styles.input, { fontFamily: 'Jua', textAlignVertical: 'top' }]} 
          placeholderTextColor="#aaa" />
        <TextInput 
          placeholder="비밀번호" 
          style={[styles.input, { fontFamily: 'Jua', textAlignVertical: 'top' }]} 
          placeholderTextColor="#aaa" secureTextEntry />
        <TouchableOpacity style={styles.button}>
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
  joinButton: {
    marginTop: 10,
    width: '80%',
    backgroundColor: '#ffc58b',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
});