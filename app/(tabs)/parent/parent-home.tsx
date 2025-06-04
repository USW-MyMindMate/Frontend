import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const children = ['이서연', '김하윤', '박지후'];

export default function ParentHome() {
  const [selectedChild, setSelectedChild] = useState(children[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showGraphPopup, setShowGraphPopup] = useState(false); // 그래프 팝업 상태 관리

  // 감정 기록 배열
  const emotionLogs = [
    { time: '오전 10:00', emotion: '슬픔', note: '밥이 맛없었다' },
    { time: '오후 12:00', emotion: '행복', note: '' },
  ];

  // 최근 감정표현 5개 배열
  const recentEmotions = [
    { emotion: '좋아요', color: '#FFFF00', count: 3 },
    { emotion: '슬픔', color: '#0000FF', count: 1 },
    { emotion: '화나요', color: '#FF0000', count: 2 },
    { emotion: '아파요', color: '#000000', count: 2 },
  ];

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

      {/* 루틴 박스 */}
      <View style={styles.todoBox}>
        <View style={styles.routineHeader}>
          <TouchableOpacity
            onPress={() => setDropdownOpen(!dropdownOpen)}
            style={styles.childSelector}
          >
            <Text style={styles.kidName}>
              {selectedChild} <Text style={styles.arrow}>▼</Text>
            </Text>
          </TouchableOpacity>
          <Text style={styles.routineTitle}>{`'s routine`}</Text>
        </View>

        {dropdownOpen && (
          <View style={styles.dropdownOverlay}>
            {children.map((child) => (
              <TouchableOpacity
                key={child}
                onPress={() => {
                  setSelectedChild(child);
                  setDropdownOpen(false);
                }}
                style={styles.dropdownItemContainer}
              >
                <Text style={styles.dropdownItem}>{child}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.routineListVertical}>
          {[...Array(4)].map((_, index) => (
            <View key={index} style={styles.checkbox}></View>
          ))}
        </View>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.buttonTextLarge}>루틴 편집</Text>
        </TouchableOpacity>
      </View>

      {/* 감정 기록 박스 */}
      <View style={styles.tryBox}>
        <View style={styles.logList}>
          {emotionLogs.map((log, index) => (
            <Text key={index} style={styles.boxTitle}>
              {log.time} ({selectedChild} - {log.emotion}) {log.note}
            </Text>
          ))}
        </View>
        <TouchableOpacity
          style={styles.graphButton}
          onPress={() => setShowGraphPopup(true)} // 그래프 팝업 열기
        >
          <Text style={styles.buttonTextLarge}>그래프</Text>
        </TouchableOpacity>
      </View>

      {/* 그래프 팝업 */}
      <Modal
        transparent={true}
        visible={showGraphPopup}
        animationType="slide"
        onRequestClose={() => setShowGraphPopup(false)} // 팝업 닫기
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.graphTitle}>최근 감정표현 5개</Text>
            <View style={styles.recentEmotionsContainer}>
              {recentEmotions.map((emotion, index) => (
                <View key={index} style={styles.recentEmotionItem}>
                  <Text style={{ fontFamily: 'Jua', color: '#333', fontSize: 18, flex: 1 }}>
                    {emotion.emotion}
                  </Text>
                  <View
                    style={[
                      styles.graphBar,
                      { backgroundColor: emotion.color, width: emotion.count * 40 },
                    ]}
                  />
                  <Text style={{ fontFamily: 'Jua', color: '#333', fontSize: 16, marginLeft: 10 }}>
                    {emotion.count}
                  </Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowGraphPopup(false)} // 팝업 닫기
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 홈 버튼 + 마이페이지 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.homeButton}>
          <Image
            source={require('@/assets/images/home.png')}
            style={styles.homeIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.pageButton}>
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
    position: 'relative',
  },
  logList: {
    alignItems: 'flex-start',
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
  kidName: {
    fontFamily: 'Jua',
    fontSize: 22,
    color: '#333',
  },
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
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  dropdownItemContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dropdownItem: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#000',
  },
  boxTitle: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
    textAlign: 'left',
  },
  routineListVertical: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 10,
  },
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
  graphButton: {
    backgroundColor: '#FFD4AA',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  buttonTextLarge: {
    fontFamily: 'Jua',
    color: '#444',
    fontSize: 18,
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
  homeIcon: {
    width: 80,
    height: 80,
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
  graphTitle: {
    fontSize: 22,
    marginBottom: 20,
    fontFamily: 'Jua',
  },
  recentEmotionsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  recentEmotionItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginVertical: 5,
    fontFamily: 'Jua',
    marginBottom:10,
  },
  graphBar: {
    height: 20,
    marginRight: 10,
  },
  closeButton: {
    backgroundColor: '#FF9D00',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#fff',  
  },
});
