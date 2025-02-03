import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import COLORS from '../../constants/colors';
import fontsize from '../../constants/fontsize';

const HeaderComponent = ({ title, onBack, onRefresh, refreshText = "Làm mới" }) => {
    return (
        <View style={styles.header}>
            {onBack ? (
                <TouchableOpacity style={styles.headerButton} onPress={onBack}>
                   <Image source={require('../../image/left-arrow.png')}/>
                </TouchableOpacity>
            ) : (
                <View style={styles.placeholder} /> 
            )}
            <Text style={styles.headerTitle}>{title}</Text>

            <TouchableOpacity style={styles.headerButton} onPress={onRefresh}>
                <Text style={styles.headerText}>{refreshText}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.azureblue,
        padding: 10,
    },
    headerButton: {
        padding: 10,
    },
    placeholder: {
        width: 50, // Đảm bảo không gian cho nút Back nếu không có
    },
    headerText: {
        color: COLORS.white,
        fontSize: fontsize.md,
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: fontsize.lg,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1, // Chiếm không gian còn lại để giữ tiêu đề ở giữa
    },
});

export default HeaderComponent;
