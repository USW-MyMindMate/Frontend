import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const BASE_URL = 'http://localhost:8080'; // 🚨 IP 주소 수정 필요

const emotionMapping = {
  좋아요: 'HAPPY',
  슬퍼요: 'SAD',
  화나요: 'ANGRY',
  아파요: 'SICK',
};

const emotionIcons = {
  좋아요: require('../../../assets/images/emoji_happy.png'),
  슬퍼요: require('../../../assets/images/emoji_sad.png'),
  화나요: require('../../../assets/images/emoji_angry.png'),
  아파요: require('../../../assets/images/emoji_sick.png'),
};

export default function ChildHomeScreen() {
  const [checkedItems, setCheckedItems] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [routines, setRoutines] = useState<any[]>([]);

  const [isPopupVisible, setIsPopupVisible] = useState(true);
  const [emotionReason, setEmotionReason] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const [isMoodRecorded, setIsMoodRecorded] = useState(false);

  const [recommendations, setRecommendations] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const toggleCheck = (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
  };

  const handleShowMood = () => {
    setIsPopupVisible(true);
  };

  // ✅ [추가] 루틴 목록을 불러오는 함수
  const fetchRoutines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const childUserId = await AsyncStorage.getItem('CHILD_USER_ID');
      if (!childUserId) {
        setError('로그인 정보가 없습니다.');
        return;
      }

      // 🚨 가정: 아이의 루틴 목록을 조회하는 API 엔드포인트
      const url = `${BASE_URL}/api/routines?userId=${childUserId}`;

      const response = await fetch(url, { method: 'GET' });

      if (response.ok) {
        const data = await response.json();
        const fetchedRoutines = data || [];

        setRoutines(fetchedRoutines);

        // 루틴 개수에 맞춰 checkedItems 상태 초기화 (실제로는 API에서 완료 로그를 가져와야 함)
        setCheckedItems(new Array(fetchedRoutines.length).fill(false));
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || '루틴 목록을 불러오는 데 실패했습니다.'
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '루틴 조회 중 네트워크 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('Fetch Routines Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDoneMood = async () => {
    if (isMoodRecorded) {
      setIsPopupVisible(false); // 재확인 모드에서는 닫기
      return;
    }

    if (!selectedEmotion) {
      Alert.alert('알림', '감정을 먼저 선택해주세요!');
      return;
    }

    setLoading(true);
    setError(null);

    const moodTypeName =
      emotionMapping[selectedEmotion as keyof typeof emotionMapping];

    try {
      const childUserId = await AsyncStorage.getItem('CHILD_USER_ID');

      if (!childUserId) {
        Alert.alert('오류', '로그인 정보가 없습니다.');
        return;
      }

      const headers = {
        'Content-Type': 'application/json', // ✅ 2. Postman 명세에 따라 X-User-Id 헤더 사용
        //'X-User-Id': childUserId,
      };

      const response = await fetch(`${BASE_URL}/api/moods`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          // Body에는 userId (Postman 명세)
          userId: parseInt(childUserId),
          reason: emotionReason,
          moodTypeName: moodTypeName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // 3. 감정 기록 완료 후, 서버 응답에서 'recommendation' 필드를 바로 사용
        setIsMoodRecorded(true);
        setIsPopupVisible(false);

        // recommendation이 문자열 하나일 경우 배열로 만들어 상태에 저장
        if (data.recommendation) {
          setRecommendations([data.recommendation]);
        } else {
          setRecommendations([]);
        }

        setIsPopupVisible(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '감정 기록에 실패했습니다.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
      Alert.alert('에러', error || '감정 기록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChildLogout = useCallback(async () => {
    try {
      // 1. AsyncStorage에서 아이 계정 정보(childAccount)를 가져옴
      const childAccount = await AsyncStorage.getItem('CHILD_USER_ID');
      if (!childAccount) {
        Alert.alert('오류', '로그인 정보가 없습니다. 앱에서 로그아웃합니다.');
        await AsyncStorage.removeItem('CHILD_USER_ID');
        // router.replace('/'); // 메인 또는 로그인 화면으로 이동
        return;
      }

      // 2. API 호출: GET /user/child-logout?childAccount=...
      const url = `${BASE_URL}/user/child-logout?childAccount=${childAccount}`;

      const response = await fetch(url, {
        method: 'GET', // 명세에 따라 GET 사용
        // Body가 있지만 GET 요청이라 Query Param으로 처리하는 것이 일반적입니다.
        // Postman 예시 curl에서 data 부분이 Query Param처럼 동작한다고 가정하고 URL에 포함
      });

      // 3. 응답 처리
      let data = null;
      try {
        data = await response.json();
      } catch (e) {
        // 응답이 JSON이 아닐 수도 있으므로 예외 처리
        console.warn('Logout response not JSON', e);
      }

      if (response.ok || response.status === 200) {
        // 성공 시 로컬 저장소 삭제 및 화면 이동
        await AsyncStorage.removeItem('CHILD_USER_ID');
        Alert.alert('로그아웃 성공', data?.message || '로그아웃되었습니다.');
        router.replace('/'); // 앱 시작 화면이나 로그인 화면으로 이동
      } else {
        // 서버에서 오류 응답 (400, 500 등)이 왔을 경우
        throw new Error(
          data?.message || '로그아웃 처리에 실패했습니다. 강제 로그아웃합니다.'
        );
      }
    } catch (err: unknown) {
      // 네트워크 오류 또는 서버 오류 처리
      const errorMessage =
        err instanceof Error
          ? err.message
          : '네트워크 문제로 로그아웃 처리 중 오류가 발생했습니다.';

      Alert.alert('로그아웃 오류', errorMessage);
      console.error(err);

      // 오류 발생 시에도 안전을 위해 로컬 로그인 정보는 삭제하고 이동
      await AsyncStorage.removeItem('CHILD_USER_ID');
      router.replace('/');
    }
  }, [router]);

  // ✅ 컴포넌트 마운트 시 userId를 가져와 상태에 저장
  useEffect(() => {
    const checkAndFetch = async () => {
      const userId = await AsyncStorage.getItem('CHILD_USER_ID');
      if (userId) {
        await fetchRoutines(); // 아이디가 있을 때 루틴 불러오기
      }
      // 이전에 있던 checkUserId 로직 대체
    };
    checkAndFetch();
  }, [fetchRoutines]);

  return (
    <View style={styles.container}>
      {/* 로고 */}
      <Text style={styles.logo}>
        <Text style={styles.logoHighlight}>M</Text>
        <Text style={styles.logoLight}>y</Text>
        <Text style={styles.logoHighlight}>M</Text>
        <Text style={styles.logoLight}>ind</Text>
        <Text style={styles.logoHighlight}>M</Text>
        <Text style={styles.logoLight}>ate</Text>
      </Text>

      {/* 오늘의 할 일 */}
      <View style={styles.todoBox}>
        <Text style={[styles.boxTitle, { fontFamily: 'Jua' }]}>
          오늘의 할 일
        </Text>

        {loading && (
          <Text style={styles.loadingText}>루틴 목록을 불러오는 중...</Text>
        )}

        {/* ✅ [수정] API에서 가져온 routines 목록 렌더링 */}
        {!loading &&
          routines.length > 0 &&
          routines.map((routine, index: number) => (
            <TouchableOpacity
              key={routine.id || index} // API에서 받은 ID를 키로 사용
              style={styles.todoItem}
              onPress={() => toggleCheck(index)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  checkedItems[index] && styles.checkboxChecked,
                ]}
              >
                {checkedItems[index] && <Text style={styles.checkmark}>✓</Text>}
              </View>
              {/* ✅ 루틴 제목 표시 */}
              <Text style={[styles.todoText, { fontFamily: 'Jua' }]}>
                {routine.title || routine.name || `루틴 ${index + 1}`}
              </Text>
            </TouchableOpacity>
          ))}

        {/* 루틴이 없거나 오류가 있을 때 메시지 표시 */}
        {!loading && !error && routines.length === 0 && (
          <Text
            style={[styles.todoText, { textAlign: 'center', marginTop: 30 }]}
          >
            아직 부모님이 등록한 루틴이 없습니다.
          </Text>
        )}

        {error && <Text style={styles.errorText}>루틴 오류: {error}</Text>}
      </View>

      {/* 이걸 해볼까? */}
      <View style={styles.tryBox}>
        <Text style={[styles.boxTitle, { fontFamily: 'Jua' }]}>
          이걸 해볼까?
        </Text>
        {loading ? (
          <Text style={styles.loadingText}>추천 활동을 불러오는 중...</Text>
        ) : error ? (
          <Text style={styles.errorText}>오류 발생: {error}</Text>
        ) : (
          <View>
            {recommendations &&
              recommendations.map((rec, index) => (
                <Text key={index} style={styles.recommendationText}>
                  - {rec}
                </Text>
              ))}
          </View>
        )}
      </View>

      <View style={styles.bottomButtons}>
        {/* 1. 왼쪽: 로그아웃 버튼 */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleChildLogout}
        >
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>

        {/* 3. 오른쪽: 홈 아이콘 */}
        <TouchableOpacity style={styles.homeButton}>
          <Image
            source={require('../../../assets/images/home.png')}
            style={styles.homeIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* 2. 가운데: 감정 확인 버튼 (요청하신 기능) */}
        {/* 기록 완료 여부와 관계없이 팝업을 다시 띄울 수 있게 합니다. */}
        <TouchableOpacity
          style={styles.viewMoodButton}
          onPress={handleShowMood}
        >
          <Text style={styles.viewMoodButtonText}>
            오늘의 감정 {!isMoodRecorded ? '기록' : '확인'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 팝업 오버레이 */}
      {isPopupVisible && (
        <View style={styles.popupOverlay}>
          <View style={styles.popupContainer}>
            <TouchableOpacity
              onPress={() => setIsPopupVisible(false)}
              style={styles.popupClose}
            >
              <Text style={{ fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.popupTitle}>지금의 감정을 선택해!</Text>

            <View style={styles.emotionRow}>
              {['좋아요', '슬퍼요', '화나요', '아파요'].map((emotion, idx) => {
                const isSelected = selectedEmotion === emotion;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.emotionImageButton,
                      isSelected && styles.emotionButtonSelected,
                    ]}
                    onPress={() => {
                      // ✅ 수정: 기록 후 수정 불가능
                      if (!isMoodRecorded) {
                        setSelectedEmotion(emotion);
                      }
                    }}
                    disabled={isMoodRecorded} // ✅ 기록 후 버튼 비활성화
                  >
                    <Image
                      source={
                        emotionIcons[emotion as keyof typeof emotionIcons]
                      }
                      style={styles.emotionIcon}
                    />
                    <Text
                      style={[
                        styles.emotionLabel,
                        isSelected && styles.emotionTextSelected,
                      ]}
                    >
                      {emotion}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.separator} />

            <Text style={styles.popupSubTitle}>
              왜 기분이{' '}
              {selectedEmotion ? selectedEmotion.replace(/요$/, '') : '00야'}?
            </Text>

            <TextInput
              style={styles.popupInput}
              value={emotionReason}
              onChangeText={setEmotionReason}
              placeholder="기분이 이런 이유는..."
              placeholderTextColor="#ccc"
              multiline
              editable={!isMoodRecorded} // ✅ 수정: 기록 후 수정 불가능
            />

            <Text style={styles.popupHint}>꼭 적지 않아도 괜찮아!</Text>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleDoneMood}
            >
              <Text style={styles.doneButtonText}>
                {isMoodRecorded ? '닫기' : '완료'} {/* ✅ 수정: 텍스트 변경 */}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    fontFamily: 'Jua',
    marginBottom: 30,
    marginTop: 80,
  },
  logoHighlight: {
    color: '#FF9D00',
  },
  logoLight: {
    color: '#FFC36C',
  },
  todoBox: {
    backgroundColor: '#fdecd7',
    width: '80%',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    height: 300,
  },
  boxTitle: {
    fontSize: 25,
    marginBottom: 15,
    color: '#555',
    textAlign: 'center',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  todoText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#555',
  },
  checkbox: {
    width: 30,
    height: 30,
    backgroundColor: '#f7c9a3',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#ff9d00',
  },
  checkmark: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
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
  homeButton: {
    padding: 10,
  },
  homeIcon: {
    width: 60,
    height: 60,
  },
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  popupContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    minHeight: 420,
  },
  popupClose: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  popupTitle: {
    fontSize: 20,
    fontFamily: 'Jua',
    marginBottom: 20,
  },
  emotionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
  },
  emotionTextSelected: {
    color: '#fff',
  },
  emotionImageButton: {
    backgroundColor: '#fff8f0', // 배경색을 폼 배경과 다른 밝은 색으로
    width: '48%', // 4개 버튼이 한 줄에 들어가도록 너비 조정
    aspectRatio: 1, // 정사각형 유지
    borderRadius: 15,
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  emotionButtonSelected: {
    backgroundColor: '#FF9D00',
    borderWidth: 2,
    borderColor: '#fff',
  }, // ✅ 6. 이모티콘 이미지 스타일 정의

  emotionIcon: {
    width: '65%',
    height: '65%',
    resizeMode: 'contain',
    marginBottom: 2,
  }, // ✅ 7. 감정 레이블 텍스트 스타일 정의

  emotionLabel: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#555',
  },
  emotionLabelSelected: {
    color: '#fff',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    marginTop: 5, // 👈 marginVertical 15에서 marginTop 5로 축소
    marginBottom: 15,
  },
  popupSubTitle: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#333',
    marginTop: 5,
    marginBottom: 15,
    textAlign: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  popupInput: {
    width: '100%',
    height: 100,
    backgroundColor: '#fff8f0',
    borderRadius: 10,
    padding: 10,
    fontFamily: 'Jua',
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  popupHint: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#FF9D00',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  doneButton: {
    backgroundColor: '#FF9D00',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  doneButtonText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#fff',
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
  recommendationText: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 20,
    width: '95%',
    flexDirection: 'row',
    justifyContent: 'space-around', // 버튼들을 양 끝으로 분산
    alignItems: 'center',
  },
  // ✅ [추가] 로그아웃 버튼 스타일
  logoutButton: {
    backgroundColor: '#FFD4AA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  logoutButtonText: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#333',
  },
  viewMoodButton: {
    backgroundColor: '#B0E0E6', // 새로운 색상 추가
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  viewMoodButtonText: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#333',
  },
  // ✅ [추가] 비활성화된 입력 필드 스타일
  popupInputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#888',
  },
});
