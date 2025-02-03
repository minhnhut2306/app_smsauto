import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import fontsize from '../../constants/fontsize';
import COLORS from '../../constants/colors';

const { width } = Dimensions.get('window');

const ButtonComponent = ({ title, onPress, color = COLORS.azureblue, widthPercentage = 80, textColor = 'black', fontSize = fontsize.md, style }) => {
    const buttonWidth = (width * widthPercentage) / 100;

    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: color, width: buttonWidth }, style]}
            onPress={onPress}
        >
            <Text style={[styles.buttonText, { color: textColor, fontSize: fontSize }]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 6,
    },
    buttonText: {
        fontWeight: 'bold',
    }
});

export default ButtonComponent;
