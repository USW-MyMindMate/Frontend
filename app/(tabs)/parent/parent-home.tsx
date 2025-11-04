import CustomDropdown from '@/components/CustomDropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
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
  uniqueId: string; // API URL에서 사용할 ID로 가정합니다.
  userId: string; // 기존 코드의 userId와 동일한 역할을 하도록 필드 추가
  // ... 기타 필드 (birthYear, birthMonth, etc.)
}

export default function ParentHome() {
  // ✅ children과 selectedChild를 state로 변경
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showGraphPopup, setShowGraphPopup] = useState(false);
  const [isEditPage, setIsEditPage] = useState(false);

  const [routineList, setRoutineList] = useState<any[]>([]);
  const [routineLogs, setRoutineLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const getAuthHeaders = useCallback(async () => {
    const parentUserId = await AsyncStorage.getItem('PARENT_USER_ID');
    if (!parentUserId) {
      router.push('/parent/parent-login'); // ✅ router 바로 사용
      return null;
    }
    return {
      'Content-Type': 'application/json',
      'X-User-Id': parentUserId,
    };
  }, [router]);

  // 자녀 목록 조회 및 상태 초기화 함수 (ParentMyPage와 동일한 API 사용)
  const fetchChildren = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${BASE_URL}/child/parent`, {
        method: 'GET',
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();

        setChildren(data);

        if (data.length > 0) {
          // 첫 번째 자녀를 기본 선택
          setSelectedChild(data[0]);
          setSelectedChildIndex(0);
        } else {
          setSelectedChild(null);
          Alert.alert('알림', '등록된 자녀 정보가 없습니다.');
        }
      } else {
        Alert.alert('오류', '자녀 목록을 불러오는 데 실패했습니다.');
      }
    } catch (err) {
      console.error('자녀 목록 조회 오류:', err);
      Alert.alert('에러', '네트워크 오류가 발생했습니다.');
    }
  }, [router, getAuthHeaders]);

  // 컴포넌트 마운트 시 자녀 목록 조회
  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]); // 루틴 조회 시 selectedChild.userId를 사용 (API 응답 데이터에 userId 필드가 있다고 가정)

  const fetchRoutines = useCallback(async () => {
    if (!selectedChild || !selectedChild.userId) return; // ✅ selectedChild가 설정되지 않았으면 리턴

    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      if (!headers) {
        throw new Error('로그인 정보가 없습니다. 다시 로그인해 주세요.');
      }

      const response = await fetch(
        `${BASE_URL}/api/routines/user/${selectedChild.userId}`, // selectedChild.userId 사용
        {
          method: 'GET',
          headers: headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRoutineList(data);
      } else {
        throw new Error('루틴 정보를 불러오는 데 실패했습니다.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedChild, getAuthHeaders]);

  // 루틴 로그 조회 시 selectedChild.userId를 사용
  const fetchRoutineLogs = useCallback(async () => {
    if (!selectedChild || !selectedChild.userId) return; // ✅ selectedChild가 설정되지 않았으면 리턴

    try {
      const headers = await getAuthHeaders();
      if (!headers) return;

      const response = await fetch(
        `${BASE_URL}/api/routine-logs/user/${selectedChild.userId}`, // selectedChild.userId 사용
        {
          method: 'GET',
          headers: headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRoutineLogs(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedChild, getAuthHeaders]); // ✅ selectedChild가 변경될 때마다 호출되도록 설정

  const handleRoutineCheck = async (
    routineId: number,
    isCompleted: boolean
  ) => {
    if (!selectedChild || !selectedChild.userId) return; // ✅ selectedChild 확인

    try {
      const headers = await getAuthHeaders();

      if (!headers) {
        Alert.alert('알림', '로그인 정보가 없습니다. 다시 로그인해 주세요.');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/routine-logs`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          routineId,
          userId: selectedChild.userId, // selectedChild.userId 사용
          isCompleted,
        }),
      });

      if (response.ok) {
        fetchRoutineLogs();
      } else {
        Alert.alert('오류', '루틴 상태 업데이트에 실패했습니다.');
      }
    } catch (err) {
      Alert.alert('에러', '네트워크 오류.');
      console.error(err);
    }
  };

  // ✅ selectedChild가 변경될 때마다 루틴/로그를 다시 불러옵니다.
  useEffect(() => {
    if (selectedChild) {
      fetchRoutines();
      fetchRoutineLogs();
    }
  }, [selectedChild, fetchRoutines, fetchRoutineLogs]);

  const addRoutine = () => {
    setRoutineList([
      ...routineList,
      { title: `할 일 ${routineList.length + 1}` },
    ]);
  };

  const updateRoutine = (index: number, value: string) => {
    const updated = [...routineList];
    updated[index].title = value;
    setRoutineList(updated);
  };

  const removeRoutine = (index: number) => {
    const updated = [...routineList];
    updated.splice(index, 1);
    setRoutineList(updated);
  };

  const isRoutineCompleted = (routineId: number) => {
    return routineLogs.some(
      (log) => log.routineId === routineId && log.isCompleted
    );
  };

  // 템플릿 데이터는 그대로 유지합니다.
  const emotionLogs = [
    { time: '오전 10:00', emotion: '슬픔', note: '밥이 맛없었다' },
    { time: '오후 12:00', emotion: '행복', note: '' },
  ];

  const recentEmotions = [
    { emotion: '좋아요', color: '#FFFF00', count: 3 },
    { emotion: '슬픔', color: '#0000FF', count: 1 },
    { emotion: '화나요', color: '#FF0000', count: 2 },
    { emotion: '아파요', color: '#000000', count: 2 },
  ];

  if (isEditPage) {
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

        <View style={styles.editBox}>
          <View style={styles.routineHeader}>
            <CustomDropdown
              options={children.map((c) => c.name)}
              selectedIndex={selectedChildIndex}
              onSelect={(index) => setSelectedChildIndex(index)}
            />
            <Text style={styles.routineTitle}>{`'s routine`}</Text>
          </View>

          {routineList.map((item, index) => (
            <View key={index} style={styles.editRoutineRow}>
              <TextInput
                style={styles.editInputBox}
                value={item.title}
                onChangeText={(text) => updateRoutine(index, text)}
              />
              <TouchableOpacity
                onPress={() => removeRoutine(index)}
                style={styles.removeButton}
              >
                <Text style={styles.removeText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity onPress={addRoutine} style={styles.addButton}>
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.editDoneButton}
          onPress={() => setIsEditPage(false)}
        >
          <Text style={styles.buttonTextLarge}>편집 완료</Text>
        </TouchableOpacity>
      </View>
    );
  }
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

      <View style={styles.todoBox}>
        <View style={styles.routineHeader}>
          <CustomDropdown
            options={children.map((c) => c.name)}
            selectedIndex={selectedChildIndex}
            onSelect={(index) => {
              setSelectedChildIndex(index);
              setSelectedChild(children[index]);
            }}
          />
          <Text style={styles.routineTitle}>{`'s routine`}</Text>
        </View>

        {dropdownOpen && (
          <View style={styles.dropdownOverlay}>
            {children.map((child) => (
              <TouchableOpacity
                key={child.userId}
                onPress={() => {
                  setSelectedChild(child);
                  setDropdownOpen(false);
                }}
                style={styles.dropdownItemContainer}
              >
                <Text style={styles.dropdownItem}>{child.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loading ? (
          <Text style={styles.loadingText}>루틴을 불러오는 중...</Text>
        ) : error ? (
          <Text style={styles.errorText}>오류 발생: {error}</Text>
        ) : (
          <ScrollView
            style={{ maxHeight: 180 }}
            contentContainerStyle={styles.routineListVertical}
          >
            {routineList.map((item) => {
              const isCompleted = isRoutineCompleted(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.routineItemRow}
                  onPress={() => handleRoutineCheck(item.id, !isCompleted)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      isCompleted && styles.checkboxCompleted,
                    ]}
                  />
                  <Text
                    style={[
                      styles.boxTitle,
                      isCompleted && styles.boxTitleCompleted,
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditPage(true)}
        >
          <Text style={styles.buttonTextLarge}>루틴 편집</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tryBox}>
        <View style={styles.logList}>
          {emotionLogs.map((log, index) => (
            <Text key={index} style={styles.boxTitle}>
              {log.time} ({selectedChild?.name} - {log.emotion}) {log.note}
            </Text>
          ))}
        </View>
        <TouchableOpacity
          style={styles.graphButton}
          onPress={() => setShowGraphPopup(true)}
        >
          <Text style={styles.buttonTextLarge}>그래프</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={showGraphPopup}
        animationType="slide"
        onRequestClose={() => setShowGraphPopup(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.graphTitle}>최근 감정표현 5개</Text>
            <View style={styles.recentEmotionsContainer}>
              {recentEmotions.map((emotion, index) => (
                <View key={index} style={styles.recentEmotionItem}>
                  <Text
                    style={{
                      fontFamily: 'Jua',
                      color: '#333',
                      fontSize: 18,
                      flex: 1,
                    }}
                  >
                    {emotion.emotion}
                  </Text>
                  <View
                    style={[
                      styles.graphBar,
                      {
                        backgroundColor: emotion.color,
                        width: emotion.count * 40,
                      },
                    ]}
                  />
                  <Text
                    style={{
                      fontFamily: 'Jua',
                      color: '#333',
                      fontSize: 16,
                      marginLeft: 10,
                    }}
                  >
                    {emotion.count}
                  </Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowGraphPopup(false)}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.homeButton}>
          <Image
            source={require('@/assets/images/home.png')}
            style={{ width: 80, height: 80, marginTop: 30 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pageButton}
          onPress={() => router.push('/parent/parent-myPage')}
        >
          <Text style={styles.buttonTextLarge}>마이페이지</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 36,
    color: 'orange',
    fontFamily: 'Jua',
    marginBottom: 30,
    marginTop: 80,
  },
  logoHighlight: { color: '#FF9D00' },
  logoLight: { color: '#FFC36C' },
  todoBox: {
    backgroundColor: '#fdecd7',
    width: '80%',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    height: 300,
    position: 'relative',
    overflow: 'visible',
  },
  tryBox: {
    backgroundColor: '#fdecd7',
    width: '80%',
    borderRadius: 15,
    padding: 20,
    justifyContent: 'flex-start',
    height: 300,
    marginBottom: 20,
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  childSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD4AA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  kidName: { fontFamily: 'Jua', fontSize: 22, color: '#333' },
  arrow: { color: '#333' },
  routineTitle: {
    fontFamily: 'Jua',
    fontSize: 22,
    marginLeft: 8,
    color: '#333',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 50,
    left: 25,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    zIndex: 10,
    elevation: 5,
  },
  dropdownItemContainer: { paddingVertical: 6, paddingHorizontal: 12 },
  dropdownItem: { fontFamily: 'Jua', fontSize: 18, color: '#000' },
  boxTitle: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#555',
    textAlignVertical: 'center',
    marginLeft: 12,
    lineHeight: 30,
  },
  routineListVertical: { flexDirection: 'column', gap: 12, marginTop: 10 },
  checkbox: {
    width: 30,
    height: 30,
    backgroundColor: '#f7c9a3',
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#FFD4AA',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  editDoneButton: {
    backgroundColor: '#ffd699',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 30,
    alignSelf: 'center',
    marginBottom: 40,
  },
  graphButton: {
    backgroundColor: '#FFD4AA',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  buttonTextLarge: { fontFamily: 'Jua', color: '#444', fontSize: 18 },
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
  homeIcon: { width: 80, height: 80 },
  pageButton: {
    position: 'absolute',
    right: 40,
    backgroundColor: '#FFD4AA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    bottom: 50,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
  },
  graphTitle: { fontSize: 22, marginBottom: 20, fontFamily: 'Jua' },
  recentEmotionsContainer: { width: '100%', marginBottom: 20 },
  recentEmotionItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginVertical: 5,
    fontFamily: 'Jua',
    marginBottom: 10,
  },
  graphBar: { height: 20, marginRight: 10 },
  closeButton: {
    backgroundColor: '#FF9D00',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: { fontFamily: 'Jua', fontSize: 18, color: '#fff' },
  editPageContent: { paddingBottom: 100, alignItems: 'center' },
  routineItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    fontFamily: 'Jua',
  },
  removeButton: {
    marginLeft: 10,
    backgroundColor: '#ffaaaa',
    padding: 8,
    borderRadius: 8,
  },
  removeText: { color: '#fff', fontWeight: 'bold' },
  addButton: {
    backgroundColor: '#ffd699',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  addText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  logList: { alignItems: 'flex-start' },
  editRoutineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  editInputBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    fontFamily: 'Jua',
    color: '#555',
  },
  editBox: {
    backgroundColor: '#fff3eb',
    borderRadius: 16,
    padding: 16,
    width: '80%',
  },
  loadingText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  checkboxCompleted: {
    backgroundColor: 'green',
  },
  boxTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
});
