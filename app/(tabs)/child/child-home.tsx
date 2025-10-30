import AsyncStorage from '@react-native-async-storage/async-storage';
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

export default function ChildHomeScreen() {
  const [checkedItems, setCheckedItems] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [isPopupVisible, setIsPopupVisible] = useState(true);
  const [emotionReason, setEmotionReason] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCheck = (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
  };

  const fetchRecommendations = useCallback(async (moodTypeName: string) => {
    setLoading(true);
    try {
      const childUserId = await AsyncStorage.getItem('childUserId');

      if (!childUserId) {
        throw new Error('아이디 정보가 없습니다.');
      }

      const headers = new Headers();
      headers.append('Content-Type', 'application/json');

      const response = await fetch(
        `${BASE_URL}/api/moods/recommend?moodTypeName=${moodTypeName}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': childUserId,
          },
        }
      );

      if (response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : [];
        setRecommendations(data);
      } else {
        setRecommendations(['추천 활동을 가져오는데 실패했습니다.']);
      }
    } catch (err: unknown) {
      setRecommendations(['네트워크 오류로 추천 활동을 가져올 수 없습니다.']);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDoneMood = async () => {
    if (!selectedEmotion) {
      Alert.alert('알림', '감정을 먼저 선택해주세요!');
      return;
    }

    setLoading(true);
    setError(null);

    const moodTypeName =
      emotionMapping[selectedEmotion as keyof typeof emotionMapping];

    try {
      const childUserId = await AsyncStorage.getItem('childUserId');

      if (!childUserId) {
        Alert.alert('오류', '로그인 정보가 없습니다.');
        return;
      }

      const headers = new Headers();
      headers.append('Content-Type', 'application/json'); // ✅ Postman 명세에 따라 X-User-Id 헤더에 아이디 담기
      headers.append('X-User-Id', childUserId);

      const response = await fetch('http://3.39.122.126:8080/api/moods', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          userId: parseInt(childUserId), // ✅ userId 상태 변수를 사용
          reason: emotionReason,
          moodTypeName: moodTypeName,
        }),
      });

      if (response.ok) {
        await fetchRecommendations(moodTypeName);
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

  // ✅ 컴포넌트 마운트 시 userId를 가져와 상태에 저장
  useEffect(() => {
    const loadUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      setUserId(storedUserId);
    };
    loadUserId();
  }, []);

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
        {[1, 2, 3, 4].map((item, index: number) => (
          <TouchableOpacity
            key={item}
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
            <Text style={[styles.todoText, { fontFamily: 'Jua' }]}>
              할 일 {item}
            </Text>
          </TouchableOpacity>
        ))}
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

      {/* 홈 아이콘 */}
      <TouchableOpacity style={styles.homeButton}>
        <Image
          source={require('../../../assets/images/home.png')}
          style={styles.homeIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

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
                      styles.emotionButton,
                      isSelected && styles.emotionButtonSelected,
                    ]}
                    onPress={() => setSelectedEmotion(emotion)}
                  >
                    <Text
                      style={[
                        styles.emotionText,
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
            />

            <Text style={styles.popupHint}>꼭 적지 않아도 괜찮아!</Text>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleDoneMood}
            >
              <Text style={styles.doneButtonText}>완료</Text>
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
    alignSelf: 'center',
    padding: 10,
  },
  homeIcon: {
    width: 80,
    height: 80,
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
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  emotionButton: {
    backgroundColor: '#fdecd7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    margin: 5,
  },
  emotionButtonSelected: {
    backgroundColor: '#FF9D00',
  },
  emotionText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#333',
  },
  emotionTextSelected: {
    color: '#fff',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 15,
  },
  popupSubTitle: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#333',
    marginBottom: 10,
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
});
