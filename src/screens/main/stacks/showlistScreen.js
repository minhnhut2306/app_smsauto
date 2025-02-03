import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions, Alert, ImageBackground } from 'react-native';
import HeaderComponent from '../../../components/HeaderComponent/HeaderComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const phoneRegex = {
    Mobi: /^(090|093|089|070|076|077|078|079)/,
    Viettel: /^(098|097|096|086|032|033|034|035|036|037|038|039)/,
    Vina: /^(091|094|088|081|082|083|084|085|087)/,
};
const ShowlistScreen = ({ route }) => {
    const { simType } = route.params || {};
    const [phoneList, setPhoneList] = useState([]);
    useEffect(() => {
        if (!simType) {
            Alert.alert('Thông báo', 'Bạn chưa chọn loại SIM!');
            return;
        }
        const loadData = async () => {
            try {
                const storedData = await AsyncStorage.getItem('sheetData');
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    const filteredPhones = parsedData.filter(item => {
                        let phone = item.PHONE.toString().trim();

                        if (phone.length === 9) {
                            phone = '0' + phone;
                        }
                        console.log(phone);
                        if (simType === 'Mobi' && phoneRegex.Mobi.test(phone)) {
                            return true;
                        } else if (simType === 'Viettel' && phoneRegex.Viettel.test(phone)) {
                            return true;
                        } else if (simType === 'Vina' && phoneRegex.Vina.test(phone)) {
                            return true;
                        }

                        return false;
                    });
                    setPhoneList(filteredPhones);
                } else {
                    Alert.alert('Thông báo', 'Không có dữ liệu sheet trong bộ nhớ!');
                }
            } catch (error) {
                Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải dữ liệu.');
            }
        };

        loadData();
    }, [simType]);

    const handlePhoneClick = (phoneNumber) => {
        console.log(`Số điện thoại được chọn: ${phoneNumber}`);
    };

    return (
        <ImageBackground
        source={require('../../../image/imgae.png')}
        style={styles.container}
        resizeMode="cover"
    >
            <HeaderComponent title="Hiển thị danh sách" onRefresh={() => { }} refreshText="" />
            {phoneList.length > 0 ? (
                <FlatList
                showsVerticalScrollIndicator={false}
                    data={phoneList}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            style={[styles.phoneItem, { width: width * 0.9 }]}
                            onPress={() => handlePhoneClick(item.PHONE)}
                        >
                            <Text style={styles.phoneText}>
                            <Text>{index + 1}. {item.PHONE ? 0 + item.PHONE : ''} - {item.TEN}</Text>
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <Text style={styles.noDataText}>Không có dữ liệu để hiển thị</Text>
            )}
        </ImageBackground>
    );
};

export default ShowlistScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
    },
    phoneItem: {
        backgroundColor: '#f5f5f5',
        marginVertical: 8,
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    phoneText: {
        fontSize: 16,
        color: '#333',
    },
    noDataText: {
        fontSize: 16,
        color: '#999',
        marginTop: 20,
    },
});
