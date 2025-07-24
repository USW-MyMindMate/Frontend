// components/CustomDropdown.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CustomDropdownProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function CustomDropdown({
  options,
  selectedIndex,
  onSelect,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.button, isOpen && styles.buttonOpen]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.buttonText}>
          {options[selectedIndex] || '선택'} ▼
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.item,
                index === selectedIndex && styles.selectedItem,
              ]}
              onPress={() => {
                onSelect(index);
                setIsOpen(false);
              }}
            >
              <Text
                style={[
                  styles.itemText,
                  index === selectedIndex && styles.selectedItemText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    zIndex: 100,
    position: 'relative',
  },
  button: {
    backgroundColor: '#fde2cf',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  buttonOpen: {
    backgroundColor: '#FF9D00',
  },
  buttonText: {
    fontFamily: 'Jua',
    fontSize: 20,
    lineHeight: 24,
    color: '#333',
  },
  dropdown: {
    backgroundColor: '#fdecd7',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 100,
    position: 'absolute',
    top: 55,
    zIndex: 999,
  },
  item: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  selectedItem: {
    backgroundColor: '#FFD4AA',
  },
  itemText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  selectedItemText: {
    fontWeight: 'bold',
  },
});
