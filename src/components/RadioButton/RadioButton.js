import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';
import fontsize from '../../constants/fontsize';

const RadioButton = ({ option, selected, onSelect }) => (
  <TouchableOpacity style={styles.radioButton} onPress={() => onSelect(option.value)}>
    <View style={[styles.circle, selected === option.value && styles.selectedCircle]} />
    <Text style={styles.textlabel}>{option.label} ({option.count})</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  selectedCircle: {
    borderColor: COLORS.azureblue,
    backgroundColor: COLORS.azureblue,
  },
  textlabel: {
    fontSize: fontsize.sm,
  },
});

export default RadioButton;
