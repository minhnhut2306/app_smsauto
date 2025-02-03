import React from 'react';
import { TextInput, StyleSheet, Dimensions, View, Text } from 'react-native';
import fontsize from '../../constants/fontsize';
import COLORS from '../../constants/colors';

const { width } = Dimensions.get('window');

const InputComponent = ({
    placeholder = '',
    value,
    onChangeText,
    keyboardType = 'default',
    secureTextEntry = false,
    widthPercentage = 90,
    backgroundColor = COLORS.white,
    borderColor = COLORS.azureblue,
    borderRadius = 8,
    textColor = 'black',
    placeholderTextColor = COLORS.grey,
    numberOfLines = 20,
}) => {
    const inputWidth = (width * widthPercentage) / 100;

    return (
        <View style={[styles.container, { width: inputWidth }]}>
            <TextInput
                style={[styles.input, { backgroundColor, borderColor, borderRadius, color: textColor }]}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                multiline={true}
                numberOfLines={numberOfLines}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    label: {
        fontSize: fontsize.md,
        marginBottom: 6,
        fontWeight: 'bold',
    },
    input: {
        padding: 12,
        borderWidth: 1,
        textAlignVertical: 'top',
    },
});

export default InputComponent;
