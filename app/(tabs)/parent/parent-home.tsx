import CustomDropdown from '@/components/CustomDropdown';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const children = ['이서연', '김하윤', '박지후'];

export default function ParentHome() {
  const [selectedChild, setSelectedChild] = useState(children[0]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showGraphPopup, setShowGraphPopup] = useState(false);
  const [isEditPage, setIsEditPage] = useState(false);
  const [routineList, setRoutineList] = useState<string[]>([
    '할 일 1',
    '할 일 2',
    '할 일 3',
    '할 일 4',
  ]);

  const addRoutine = () => {
    setRoutineList([...routineList, `할 일 ${routineList.length + 1}`]);
  };

  const updateRoutine = (index: number, value: string) => {
    const updated = [...routineList];
    updated[index] = value;
    setRoutineList(updated);
  };

  const removeRoutine = (index: number) => {
    const updated = [...routineList];
    updated.splice(index, 1);
    setRoutineList(updated);
  };

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

  const router = useRouter();

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
              options={children}
              selectedIndex={selectedChildIndex}
              onSelect={(index) => setSelectedChildIndex(index)}
            />
            <Text style={styles.routineTitle}>{`'s routine`}</Text>
          </View>

          {routineList.map((item, index) => (
            <View key={index} style={styles.editRoutineRow}>
              <TextInput
                style={styles.editInputBox}
                value={item}
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
            options={children}
            selectedIndex={selectedChildIndex}
            onSelect={(index) => setSelectedChildIndex(index)}
          />
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

        <ScrollView
          style={{ maxHeight: 180 }}
          contentContainerStyle={styles.routineListVertical}
        >
          {routineList.map((item, index) => (
            <View key={index} style={styles.routineItemRow}>
              <View style={styles.checkbox} />
              <Text style={styles.boxTitle}>{item}</Text>
            </View>
          ))}
        </ScrollView>

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
              {log.time} ({selectedChild} - {log.emotion}) {log.note}
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
            style={{ width: 60, height: 60, marginTop: 30 }}
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
    position: 'relative',
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
});
