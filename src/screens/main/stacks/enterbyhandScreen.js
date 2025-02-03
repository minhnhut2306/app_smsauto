import React, { useState } from 'react';
import { StyleSheet, View, Alert, ImageBackground } from 'react-native';
import HeaderComponent from '../../../components/HeaderComponent/HeaderComponent';
import ButtonComponent from '../../../components/Buttoncomponent/Buttoncomponenrt';

import { SendDirectSms } from 'react-native-send-direct-sms';


import InputComponent from '../../../components/Inputcomponent/Inputcomponent';

const EnterbyhandScreen = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');

    const handleSendSms = async () => {
        if (!phoneNumber || !message) {
            Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại và nội dung tin nhắn.');
            return;
        }
        try {
            const res = await SendDirectSms(phoneNumber, message);
            console.log('Tin nhắn đã được gửi:', res);
        } catch (err) {
            console.error('Lỗi khi gửi tin nhắn:', err);
            Alert.alert('Lỗi', 'Không thể gửi tin nhắn.');
        }
    };
    

    return (
            <ImageBackground
                    source={require('../../../image/imgae.png')}
                    style={styles.container}
                    resizeMode="cover"
                >
            <HeaderComponent
                title="Gửi tin nhắn"
                onRefresh={() => {}}
                refreshText=""
            />
            <InputComponent
                placeholder="Nhập số điện thoại"
                widthPercentage={90}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
            />
            <InputComponent
                placeholder="Nhập họ và tên"
                widthPercentage={90}
                value={name}
                onChangeText={setName}
            />
            <InputComponent
                placeholder="Nhập nội dung"
                widthPercentage={90}
                value={message}
                onChangeText={setMessage}
            />
            <ButtonComponent
                title="Gửi"
                onPress={handleSendSms}
                color="#007bff"
                widthPercentage={90}
            />
        </ImageBackground>
    );
};

export default EnterbyhandScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
});
