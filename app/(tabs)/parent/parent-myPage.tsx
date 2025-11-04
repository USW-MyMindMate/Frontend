import CustomDropdown from '@/components/CustomDropdown'; // 상단 import 추가
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const BASE_URL = 'http://localhost:8080'; // 🚨 IP 주소 수정 필요

interface ChildInfo {
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  uniqueId: string;
}

const getAuthHeaders = async () => {
  const parentUserId = await AsyncStorage.getItem('PARENT_USER_ID');
  if (!parentUserId) {
    // 로그인 정보가 없으면 로그인 화면으로 이동
    router.push('/parent/parent-login');
    return null;
  }
  return {
    'Content-Type': 'application/json',
    'X-User-Id': parentUserId, // Postman 명세에 따른 부모 인증 헤더
  };
};

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

  const [duplicationChecked, setDuplicationChecked] = useState(false);

  // ✅ [추가] 자녀 목록 조회 함수
  const fetchChildren = useCallback(async () => {
    const headers = await getAuthHeaders();
    if (!headers) return;

    try {
      // Postman 명세: GET /child/parent
      const response = await fetch(`${BASE_URL}/child/parent`, {
        method: 'GET',
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        setChildren(data); // 로컬 상태 업데이트

        if (data.length > 0) {
          // 자녀가 있다면 첫 번째 자녀를 기본 선택하고 폼에 데이터를 채움
          setSelectedChildIndex(0);
          setForm(data[0]);
          setMode('view'); // 조회 모드로 시작
        } else {
          // 자녀가 없으면 생성 모드로 자동 전환
          setMode('create');
        }
      } else {
        Alert.alert('오류', '자녀 목록을 불러오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('자녀 목록 조회 오류:', error);
      Alert.alert('에러', '네트워크 오류가 발생했습니다.');
    }
  }, []);

  // ✅ [추가] 컴포넌트 마운트 시 자녀 목록 조회
  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);
  // ----------------------------------------------------

  const handleCreate = async () => {
    if (
      !form.name ||
      !form.birthYear ||
      !form.birthMonth ||
      !form.birthDay ||
      !form.uniqueId
    ) {
      return Alert.alert('알림', '모든 정보를 입력해 주세요.');
    }

    const headers = await getAuthHeaders();
    if (!headers) return; // 인증 실패 시 중단

    try {
      // Postman 명세: POST /child
      const response = await fetch(`${BASE_URL}/user/child`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(form), // form 데이터를 그대로 전송
      });

      const data = await response.json(); // 서버 응답 데이터

      if (response.ok) {
        // 생성 성공 후 목록을 다시 불러와 상태를 업데이트하는 것이 가장 확실
        await fetchChildren();

        setForm({
          // 폼 초기화
          name: '',
          birthYear: '',
          birthMonth: '',
          birthDay: '',
          uniqueId: '',
        });
        setDuplicationChecked(false);
        Alert.alert(
          '성공',
          data.message || '자녀 정보가 성공적으로 생성되었습니다.'
        );
      } else {
        Alert.alert('실패', data.message || '자녀 생성에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('에러', '네트워크 오류가 발생했습니다.');
      console.error(error);
    }
  }; // ---------------------------------------------------- // ✅ 2. handleEditComplete 함수 수정 (자녀 정보 수정 - PUT /child/{id}) // ----------------------------------------------------

  const handleEditComplete = async () => {
    if (selectedChildIndex === null) return;

    const headers = await getAuthHeaders();
    if (!headers) return; // 인증 실패 시 중단 // 수정 API는 보통 자녀의 고유 ID를 URL에 포함합니다. (uniqueId를 ID로 가정)

    const childId = form.uniqueId;

    try {
      // Postman 명세: PUT /child/{childId}
      const response = await fetch(`${BASE_URL}/child/${childId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        // 수정 성공 후 목록을 다시 불러와 상태를 업데이트하는 것이 가장 확실합니다.
        await fetchChildren();
        setMode('view');
        Alert.alert(
          '성공',
          data.message || '자녀 정보가 성공적으로 수정되었습니다.'
        );
      } else {
        Alert.alert('실패', data.message || '자녀 수정에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('에러', '네트워크 오류가 발생했습니다.');
      console.error(error);
    }
  };

  const currentChild =
    selectedChildIndex !== null ? children[selectedChildIndex] : null; // ---------------------------------------------------- // ✅ 3. handleLogout 함수 수정 (X-User-Id 인증 적용) // ----------------------------------------------------

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
      const parentUserId = await AsyncStorage.getItem('PARENT_USER_ID');
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');

      if (parentUserId) {
        // ✅ 2. Cookie 대신 X-User-Id 헤더에 account 담기
        headers.append('X-User-Id', parentUserId);
      } else {
        // ✅ 3. 세션이 없을 경우, 로컬에서만 로그아웃 처리 (JSESSIONID 대신 PARENT_ACCOUNT 삭제)
        alert('로그인 정보가 없습니다.');
        await AsyncStorage.removeItem('PARENT_USER_ID');
        router.push('/');
        return;
      }

      const response = await fetch(`${BASE_URL}/user/logout`, {
        method: 'POST',
        headers: headers,
      });

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
        await AsyncStorage.removeItem('PARENT_USER_ID');
        router.push('/');
        alert(data?.message || '로그아웃 되었습니다.');
      } else {
        // ✅ 400 Bad Request 등 오류 처리
        const errorMessage =
          data?.error || data?.message || '로그아웃에 실패했습니다.';
        alert(errorMessage);
        await AsyncStorage.removeItem('PARENT_USER_ID');
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
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push('/parent/parent-home')}
        >
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
