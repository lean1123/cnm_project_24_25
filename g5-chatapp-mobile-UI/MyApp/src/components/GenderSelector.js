import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GenderSelector = ({ gender, setGender }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Gender</Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={[styles.radioButton, gender === 'male' && styles.selectedButton]}
          onPress={() => setGender('male')}
        >
          <Ionicons
            name={gender === 'male' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={gender === 'male' ? '#135CAF' : '#666'}
          />
          <Text style={[styles.radioText, gender === 'male' && styles.selectedText]}>
            Male
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.radioButton, gender === 'female' && styles.selectedButton]}
          onPress={() => setGender('female')}
        >
          <Ionicons
            name={gender === 'female' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={gender === 'female' ? '#135CAF' : '#666'}
          />
          <Text style={[styles.radioText, gender === 'female' && styles.selectedText]}>
            Female
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.radioButton, gender === 'other' && styles.selectedButton]}
          onPress={() => setGender('other')}
        >
          <Ionicons
            name={gender === 'other' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={gender === 'other' ? '#135CAF' : '#666'}
          />
          <Text style={[styles.radioText, gender === 'other' && styles.selectedText]}>
            Other
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#135CAF',
    fontWeight: '500',
    fontWeight: '500'
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: '#E8F0FF',
  },
  radioText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  selectedText: {
    color: '#135CAF',
    fontWeight: '500',
  },
});

export default GenderSelector;
