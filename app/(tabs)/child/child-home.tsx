import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ChildHomeScreen() {
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false]);

  const toggleCheck = (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
  };

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
              {checkedItems[index] && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={[styles.todoText, { fontFamily: 'Jua' }]}>
              할 일 {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tryBox}>
        <Text style={[styles.boxTitle, { fontFamily: 'Jua' }]}>이걸 해볼까?</Text>
      </View>

      <TouchableOpacity style={styles.homeButton}>
        <Image
          source={require('../../../assets/images/home.png')}
          style={styles.homeIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
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
  logoHighlight: {
    color: '#FF9D00', // 진한 주황
  },
  logoLight: {
    color: '#FFC36C', // 밝은 주황
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
    fontFamily: 'Jua',
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
    fontFamily: 'Jua',
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
});