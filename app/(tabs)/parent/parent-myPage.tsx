import CustomDropdown from '@/components/CustomDropdown'; // 상단 import 추가
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ChildInfo {
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  uniqueId: string;
}

export default function ParentMyPage() {
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState<number | null>(
    null
  );
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>('view');

  const [form, setForm] = useState<ChildInfo>({
    name: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    uniqueId: '',
  });

  const handleCreate = () => {
    if (
      !form.name ||
      !form.birthYear ||
      !form.birthMonth ||
      !form.birthDay ||
      !form.uniqueId
    )
      return;
    setChildren([...children, form]);
    setForm({
      name: '',
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      uniqueId: '',
    });
    setSelectedChildIndex(children.length);
    setMode('view');
    setDuplicationChecked(false);
  };

  const handleEditComplete = () => {
    if (selectedChildIndex === null) return;
    const updated = [...children];
    updated[selectedChildIndex] = form;
    setChildren(updated);
    setMode('view');
  };

  const [duplicationChecked, setDuplicationChecked] = useState(false);

  const currentChild =
    selectedChildIndex !== null ? children[selectedChildIndex] : null;

  const renderChildInfoForm = (isEdit: boolean, isNew: boolean) => (
    <View style={styles.infoBox}>
      <Text style={styles.label}>이름</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
      />
      <Text style={styles.label}>생년월일</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 6 }]}
          placeholder="YYYY"
          keyboardType="numeric"
          value={form.birthYear}
          onChangeText={(text) => setForm({ ...form, birthYear: text })}
        />
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 6 }]}
          placeholder="MM"
          keyboardType="numeric"
          value={form.birthMonth}
          onChangeText={(text) => setForm({ ...form, birthMonth: text })}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="DD"
          keyboardType="numeric"
          value={form.birthDay}
          onChangeText={(text) => setForm({ ...form, birthDay: text })}
        />
      </View>
      <Text style={styles.label}>고유 ID</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 2, marginRight: 10 }]}
          value={form.uniqueId}
          onChangeText={(text) => setForm({ ...form, uniqueId: text })}
        />
        <TouchableOpacity
          style={styles.checkButton}
          onPress={() => setDuplicationChecked(true)}
        >
          <Text style={styles.checkText}>중복 체크</Text>
        </TouchableOpacity>
      </View>
      {duplicationChecked && (
        <Text style={styles.duplicationText}>중복 없음</Text>
      )}
      <TouchableOpacity
        style={styles.doneButton}
        onPress={isNew ? handleCreate : handleEditComplete}
      >
        <Text style={styles.doneText}>{isNew ? '생성' : '편집 완료'}</Text>
      </TouchableOpacity>
    </View>
  );

  const handleLogout = async () => {
    try {
      const sessionId = await AsyncStorage.getItem('JSESSIONID');
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');

      if (sessionId) {
        headers.append('Cookie', sessionId);
      } else {
        // ✅ 세션이 없을 경우, 로컬에서만 로그아웃 처리
        alert('세션이 없습니다.');
        await AsyncStorage.removeItem('JSESSIONID');
        router.push('/');
        return;
      }

      // ✅ 서버 IP 주소로 API 호출
      const response = await fetch('http://3.39.122.126:8080/user/logout', {
        method: 'POST',
        headers: headers,
      });

      // ✅ 세션 만료, 중복 로그아웃 등 모든 실패 케이스를 처리
      // 응답 본문이 없을 경우를 대비해 text()를 먼저 시도
      // ✅ 응답 본문이 없을 경우를 대비해 text()를 먼저 시도
      let data = null;
      try {
        const text = await response.text();
        if (text) {
          data = JSON.parse(text);
        }
      } catch (e) {
        console.warn('Response body is not JSON', e);
      }

      if (response.ok) {
        // ✅ 200 OK 응답일 경우 (정상 로그아웃 또는 중복 로그아웃)
        await AsyncStorage.removeItem('JSESSIONID');
        router.push('/');
        alert(data?.message || '로그아웃 되었습니다.');
      } else {
        // ✅ 400 Bad Request 등 오류 처리
        const errorMessage =
          data?.error || data?.message || '로그아웃에 실패했습니다.';
        alert(errorMessage);
        // 실패하더라도 로컬 세션은 삭제 (세션 만료 상태 등)
        await AsyncStorage.removeItem('JSESSIONID');
        router.push('/');
      }
    } catch (error) {
      alert('네트워크 오류. 다시 시도해 주세요.');
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>
          <Text style={styles.logoHighlight}>M</Text>
          <Text style={styles.logoLight}>y</Text>
          <Text style={styles.logoHighlight}>M</Text>
          <Text style={styles.logoLight}>ind</Text>
          <Text style={styles.logoHighlight}>M</Text>
          <Text style={styles.logoLight}>ate</Text>
        </Text>

        {children.length > 0 && (
          <View style={styles.dropdownWrapper}>
            <CustomDropdown
              options={children.map((child) => child.name)}
              selectedIndex={selectedChildIndex ?? 0}
              onSelect={(index) => {
                setSelectedChildIndex(index);
                setMode('view');
              }}
            />
          </View>
        )}

        {children.length === 0 && mode !== 'create' && (
          <TouchableOpacity
            onPress={() => {
              setMode('create');
              setForm({
                name: '',
                birthYear: '',
                birthMonth: '',
                birthDay: '',
                uniqueId: '',
              });
              setDuplicationChecked(false);
            }}
            style={styles.createButton}
          >
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        )}

        {mode === 'create' && renderChildInfoForm(false, true)}

        {mode === 'view' && currentChild && (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.label}>이름</Text>
              <Text style={styles.staticText}>{currentChild.name}</Text>
              <Text style={styles.label}>생년월일</Text>
              <Text style={styles.staticText}>
                {`${currentChild.birthYear}-${currentChild.birthMonth}-${currentChild.birthDay}`}
              </Text>
              <Text style={styles.label}>고유 ID</Text>
              <Text style={styles.staticText}>{currentChild.uniqueId}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setMode('edit');
                  setForm(currentChild);
                  setDuplicationChecked(false);
                }}
              >
                <Text style={styles.doneText}>편집</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                setMode('create');
                setForm({
                  name: '',
                  birthYear: '',
                  birthMonth: '',
                  birthDay: '',
                  uniqueId: '',
                });
              }}
              style={styles.createButton}
            >
              <Text style={styles.addText}>+</Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'edit' && renderChildInfoForm(true, false)}
      </ScrollView>
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.homeButton}>
          <Image
            source={require('@/assets/images/home.png')}
            style={{ width: 80, height: 80, marginTop: 30 }}
          />
        </TouchableOpacity>
        {/* ✅ 마이페이지 버튼을 로그아웃 버튼으로 교체하고 onPress에 handleLogout 함수 연결 */}
        <TouchableOpacity style={styles.pageButton} onPress={handleLogout}>
          <Text style={styles.buttonTextLarge}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 80, // 가운데 정렬
    minHeight: Dimensions.get('window').height, // 전체 높이만큼 공간 확보
    paddingBottom: 80,
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 36,
    fontFamily: 'Jua',
    marginTop: 80,
    marginBottom: 30,
  },
  logoHighlight: { color: '#FF9D00' },
  logoLight: { color: '#FFC36C' },

  dropdownWrapper: { alignItems: 'center' },

  dropdownItem: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#333',
    paddingVertical: 4,
  },

  infoBox: {
    backgroundColor: '#fdecd7',
    width: '80%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#444',
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    fontFamily: 'Jua',
    fontSize: 18,
    marginTop: 4,
  },
  staticText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#333',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  checkButton: {
    backgroundColor: '#FFD4AA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  checkText: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#333',
  },
  editButton: {
    backgroundColor: '#FFD4AA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-end',
    marginTop: 20,
  },
  doneButton: {
    backgroundColor: '#FFD4AA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-end',
    marginTop: 20,
  },
  doneText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#333',
  },
  createButton: {
    backgroundColor: '#FFD4AA',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 80,
    marginTop: 14,
    width: '80%',
    alignItems: 'center',
  },
  addText: {
    fontFamily: 'Jua',
    fontSize: 24,
    color: '#333',
  },
  duplicationText: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#3CB371',
    marginTop: 10,
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  bottomButtons: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    position: 'relative',
    height: 100,
  },
  homeButton: {
    position: 'absolute',
    left: '50%',
    bottom: 30,
    transform: [{ translateX: -40 }],
  },
  pageButton: {
    position: 'absolute',
    right: 40,
    backgroundColor: '#FFD4AA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    bottom: 50,
  },
  buttonTextLarge: {
    fontFamily: 'Jua',
    color: '#444',
    fontSize: 18,
  },
});
