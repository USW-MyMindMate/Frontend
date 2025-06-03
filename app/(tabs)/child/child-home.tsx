import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';

export default function ChildHomeScreen() {
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false]);
  const [isPopupVisible, setIsPopupVisible] = useState(true);
  const [emotionReason, setEmotionReason] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const toggleCheck = (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
  };

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
        <Text style={[styles.boxTitle, { fontFamily: 'Jua' }]}>오늘의 할 일</Text>
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
        <Text style={[styles.boxTitle, { fontFamily: 'Jua' }]}>이걸 해볼까?</Text>
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
                    <Text style={[
                      styles.emotionText,
                      isSelected && styles.emotionTextSelected
                    ]}>
                      {emotion}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.separator} />

            <Text style={styles.popupSubTitle}>
              왜 기분이 {selectedEmotion ? selectedEmotion.replace(/요$/, '') : '00야'}?
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

            <TouchableOpacity style={styles.doneButton} onPress={() => setIsPopupVisible(false)}>
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
});