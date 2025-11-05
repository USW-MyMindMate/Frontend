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

interface RoutineItem {
  id?: number; // 생성되지 않은 루틴은 id가 없을 수 있음
  title: string;
  time: string; // 예시로 시간 필드 추가 (Postman 명세 기반)
  dayOfWeek: string; // 예시로 요일 필드 추가
  childAccount: string;
}
// ✅ [추가] 통계 및 히스토리 데이터 인터페이스 정의
interface RoutineStats {
  totalRoutines: number;
  completionRate: number;
  completedRoutines: number;
}
interface MoodHistoryItem {
  recordedAt: string;
  moodTypeName: string;
  reason: string;
}

export default function ParentHome() {
  // ✅ children과 selectedChild를 state로 변경
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  const [showStatsModal, setShowStatsModal] = useState(false);
  const [isEditPage, setIsEditPage] = useState(false);

  const [tempRoutineList, setTempRoutineList] = useState<RoutineItem[]>([]);

  const [routineList, setRoutineList] = useState<any[]>([]);
  const [routineLogs, setRoutineLogs] = useState<any[]>([]);

  // ✅ [수정] 대시보드 API 데이터로 상태 변경
  const [routineStats, setRoutineStats] = useState<RoutineStats | null>(null);
  const [graphData, setGraphData] = useState<any | null>(null); // moodStats 저장
  // ✅ [추가] 감정 히스토리 목록 상태
  const [moodHistory, setMoodHistory] = useState<MoodHistoryItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [historyLoading, setHistoryLoading] = useState(false);

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

      const response = await fetch(`${BASE_URL}/user/find-ChildByParent`, {
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

      const accountId = selectedChild.userId;
      const url = `${BASE_URL}/api/routines?account=${accountId}`; // 쿼리 파라미터 사용

      const response = await fetch(url, { method: 'GET', headers: headers });

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

  // ✅ [API] 루틴 로그 조회
  const fetchRoutineLogs = useCallback(async () => {
    if (!selectedChild || !selectedChild.userId) return;

    try {
      const headers = await getAuthHeaders();
      if (!headers) return;

      const response = await fetch(
        `${BASE_URL}/api/routine-logs/user/${selectedChild.userId}`,
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
  }, [selectedChild, getAuthHeaders]); // ✅ [API 추가] 활동 추천 목록 조회

  const fetchDashboardData = useCallback(async () => {
    if (!selectedChild || !selectedChild.userId) return;

    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      if (!headers) throw new Error('인증 정보 없음');

      // 엔드포인트: /api/dashboard/user?account=childuser
      const accountId = selectedChild.userId;
      const url = `${BASE_URL}/api/dashboard/user?account=${accountId}`;

      const response = await fetch(url, { method: 'GET', headers: headers });

      if (response.ok) {
        const data = await response.json();
        // Postman 응답 형식에 따라 데이터 분리 및 저장
        setGraphData(data.moodStats || []); // 감정 통계 (그래프 데이터)
        setRoutineStats(data.routineStats || null); // 루틴 통계
      } else {
        setGraphData(null);
        setRoutineStats(null);
        setError('대시보드 데이터 로드 실패');
      }
    } catch (error) {
      console.error('대시보드 데이터 조회 오류:', error);
      setError('네트워크 오류로 대시보드 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedChild, getAuthHeaders]);

  const fetchMoodHistory = useCallback(async () => {
    if (!selectedChild || !selectedChild.userId) return;

    setHistoryLoading(true);
    try {
      const headers = await getAuthHeaders();
      if (!headers) throw new Error('인증 정보 없음');

      // 엔드포인트: /api/moods/history?account=childuser
      const accountId = selectedChild.userId;
      const url = `${BASE_URL}/api/moods/history?account=${accountId}`;

      const response = await fetch(url, { method: 'GET', headers: headers });

      if (response.ok) {
        const data: MoodHistoryItem[] = await response.json();
        setMoodHistory(data);
      } else {
        const errorData = await response.json();
        Alert.alert(
          '오류',
          errorData.message || '감정 히스토리를 불러오는 데 실패했습니다.'
        );
        setMoodHistory([]);
      }
    } catch (error) {
      console.error('감정 히스토리 조회 오류:', error);
      // Alert.alert('에러', '네트워크 오류가 발생했습니다.'); // 중복 알림 방지를 위해 주석 처리
      setMoodHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [selectedChild, getAuthHeaders]);

  const handleCreateRoutine = async (newRoutine: RoutineItem) => {
    if (!selectedChild || !selectedChild.userId) return;

    try {
      const headers = await getAuthHeaders();
      if (!headers) throw new Error('인증 오류');

      const response = await fetch(`${BASE_URL}/api/routines`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          childAccount: selectedChild.userId, // Postman 명세에 따라 childAccount 사용
          title: newRoutine.title,
          time: newRoutine.time || '00:00', // 기본값 설정
          dayOfWeek: newRoutine.dayOfWeek || 'MONDAY', // 기본값 설정
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('성공', '루틴이 생성되었습니다.');
        return data as RoutineItem; // 생성된 루틴 객체 (ID 포함) 반환
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '루틴 생성에 실패했습니다.');
      }
    } catch (error) {
      let errorMessage = '루틴 생성 중 네트워크 오류.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert('오류', errorMessage);
      return null;
    }
  };

  const handleUpdateRoutine = async (updatedRoutine: RoutineItem) => {
    if (!updatedRoutine.id || !selectedChild || !selectedChild.userId) return;

    try {
      const headers = await getAuthHeaders();
      if (!headers) throw new Error('인증 오류');

      const response = await fetch(
        `${BASE_URL}/api/routines/${updatedRoutine.id}`,
        {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify({
            childAccount: selectedChild.userId,
            title: updatedRoutine.title,
            time: updatedRoutine.time || '00:00',
            dayOfWeek: updatedRoutine.dayOfWeek || 'MONDAY',
          }),
        }
      );

      if (response.ok) {
        Alert.alert('성공', '루틴이 수정되었습니다.');
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '루틴 수정에 실패했습니다.');
      }
    } catch (error) {
      let errorMessage = '루틴 수정 중 네트워크 오류.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert('오류', errorMessage);
      return false;
    }
  };

  const handleRemoveRoutineAPI = async (routineId: number) => {
    try {
      const headers = await getAuthHeaders();
      if (!headers) throw new Error('인증 오류');

      const response = await fetch(`${BASE_URL}/api/routines/${routineId}`, {
        method: 'DELETE',
        headers: headers,
      });

      if (response.ok) {
        Alert.alert('성공', '루틴이 삭제되었습니다.');
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '루틴 삭제에 실패했습니다.');
      }
    } catch (error) {
      let errorMessage = '루틴 삭제 중 네트워크 오류.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert('오류', errorMessage);
      return false;
    }
  };

  const handleEditStart = () => {
    // API 응답의 모든 필드를 포함하여 복사합니다.
    setTempRoutineList(JSON.parse(JSON.stringify(routineList)));
    setIsEditPage(true);
  };

  const handleEditComplete = async () => {
    let success = true;

    // 1. 기존 루틴 수정/삭제 및 새로운 루틴 생성
    for (const routine of tempRoutineList) {
      if (!routine.id) {
        // ID가 없으면 => 새로 추가된 루틴
        const created = await handleCreateRoutine(routine);
        if (!created) {
          success = false;
          break;
        }
      } else {
        // ID가 있으면 => 기존 루틴 수정
        const updated = await handleUpdateRoutine(routine);
        if (!updated) {
          success = false;
          break;
        }
      }
    }

    const routinesToDelete = routineList.filter(
      (original) =>
        original.id && !tempRoutineList.some((temp) => temp.id === original.id)
    );

    for (const routine of routinesToDelete) {
      if (routine.id) {
        const deleted = await handleRemoveRoutineAPI(routine.id);
        if (!deleted) {
          success = false;
          break;
        }
      }
    }

    if (success) {
      // 모든 작업 성공 시, 데이터 다시 불러오기
      await fetchRoutines();
      setIsEditPage(false);
      Alert.alert('저장 완료', '루틴 목록이 성공적으로 업데이트되었습니다.');
    } else {
      // 실패 시, 편집 모드를 유지하거나 오류 메시지를 띄웁니다.
      Alert.alert(
        '저장 실패',
        '일부 루틴 저장/삭제에 실패했습니다. 다시 시도해 주세요.'
      );
    }
  };

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
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
          routineId: routineId,
          // userId: selectedChild.userId, // ❌ Body에서 userId 제거 (명세에 따라)
          isCompleted: isCompleted, // ✅ isCompleted 상태 전송
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
      fetchDashboardData();
      fetchMoodHistory();
    }
  }, [
    selectedChild,
    fetchRoutines,
    fetchRoutineLogs,
    fetchDashboardData,
    fetchMoodHistory,
  ]);

  const addRoutine = () => {
    const newRoutine: RoutineItem = {
      title: `새 루틴 ${tempRoutineList.length + 1}`,
      time: '00:00', // 기본값 설정
      dayOfWeek: 'MONDAY', // 기본값 설정
      childAccount: selectedChild?.userId || '',
      id: undefined, // ID가 없음을 명시
    };
    setTempRoutineList([...tempRoutineList, newRoutine]);
  };
  const updateRoutine = (index: number, value: string) => {
    const updated = [...tempRoutineList];
    updated[index] = { ...updated[index], title: value };
    setTempRoutineList(updated);
  };

  const removeRoutine = (index: number) => {
    const updated = [...tempRoutineList];
    updated.splice(index, 1);
    setTempRoutineList(updated);
  };

  const isRoutineCompleted = (routineId: number) => {
    return routineLogs.some(
      (log) => log.routineId === routineId && log.isCompleted
    );
  };

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
              onSelect={(index) => {
                setSelectedChildIndex(index);
                // 드롭다운 변경 시 tempRoutineList도 다시 로드해야 하지만,
                // 현재는 임시로 index만 바꿈
              }}
            />
            <Text style={styles.routineTitle}>{`'s routine`}</Text> 
          </View>
          {/* ✅ [수정] 스크롤 뷰를 사용하여 tempRoutineList 렌더링 */}
          <ScrollView style={styles.editRoutineScroll}>
            {tempRoutineList.map((item, index) => (
              <View key={item.id || index} style={styles.editRoutineRow}>
                <TextInput
                  style={styles.editInputBox}
                  value={item.title}
                  onChangeText={(text) => updateRoutine(index, text)}
                />
                {/* 🚨 [주의] 루틴 ID, Time, DayOfWeek 필드는 현재 편집 UI에 빠져있음 */}
                <TouchableOpacity
                  onPress={() => removeRoutine(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeText}>X</Text>   
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={addRoutine} style={styles.addButton}>
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.editDoneButton}
          onPress={handleEditComplete}
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

        {routineStats && (
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              완료율: **{routineStats.completionRate}%** (
              {routineStats.completedRoutines}/{routineStats.totalRoutines})
            </Text>
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

        <TouchableOpacity style={styles.editButton} onPress={handleEditStart}>
          <Text style={styles.buttonTextLarge}>루틴 편집</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tryBox}>
        <Text style={styles.sectionHeader}>최근 감정 히스토리</Text>

        <View style={styles.logList}>
          {historyLoading ? (
            <Text style={styles.loadingText}>히스토리를 불러오는 중...</Text>
          ) : moodHistory.length > 0 ? (
            <ScrollView style={{ maxHeight: 200 }}>
              {moodHistory.map((item, index) => (
                <View key={index} style={styles.historyItemRow}>
                  <Text style={styles.historyDate}>
                    {item.recordedAt.substring(0, 16)}
                  </Text>
                  <Text style={styles.historyMood}>
                    **{item.moodTypeName}**: {item.reason}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.loadingText}>
              기록된 감정 히스토리가 없습니다.
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.graphButton}
          onPress={() => setShowStatsModal(true)} // ✅ 모달 이름 변경
        >
          <Text style={styles.buttonTextLarge}>통계</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={showStatsModal} // ✅ 모달 이름 변경
        animationType="slide"
        onRequestClose={() => setShowStatsModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.graphTitle}>감정 기록 통계</Text>
            <View style={styles.recentEmotionsContainer}>
              {graphData && graphData.length > 0 ? (
                graphData.map((emotion: any, index: number) => (
                  <View key={index} style={styles.recentEmotionItem}>
                    <Text style={{ ...styles.modalText, flex: 1 }}>
                      {emotion.moodTypeName}
                    </Text>
                    <View
                      style={[
                        styles.graphBar,
                        {
                          backgroundColor: '#FF9D00',
                          width: (emotion.count || 0) * 30, // 너비 조정
                          maxWidth: 150,
                        },
                      ]}
                    />
                    <Text style={{ ...styles.modalText, marginLeft: 10 }}>
                      {emotion.count || 0}회
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.loadingText}>감정 데이터가 없습니다.</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowStatsModal(false)}
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
  statsRow: {
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD4AA',
  },
  statsText: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#333',
  },
  sectionHeader: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#FF9D00',
    marginBottom: 10,
  },
  historyItemRow: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ffd699',
  },
  historyDate: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#888',
  },
  historyMood: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  modalText: {
    fontFamily: 'Jua',
    color: '#333',
    fontSize: 16,
  },
  graphBar: { height: 20, marginRight: 10 },
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
  logList: { alignItems: 'flex-start', width: '100%' },
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
    overflow: 'hidden',
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
  editRoutineScroll: {
    maxHeight: 300,
    marginBottom: 10,
    paddingVertical: 5,
  },
});
