import { StyleSheet, Text, View, FlatList, Alert, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderComponent from '../../../components/HeaderComponent/HeaderComponent';

const SelectTemplateScreen = ({ navigation }) => {
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const storedData = await AsyncStorage.getItem('savedTemplate');
                console.log('Dữ liệu đã lưu:', storedData);

                if (storedData) {
                    try {
                        const parsedData = JSON.parse(storedData);
                        console.log('Dữ liệu đã phân tích:', parsedData);
                        setTemplates(parsedData);
                    } catch (error) {
                        console.error('Lỗi khi phân tích dữ liệu đã lưu:', error);
                        Alert.alert('Lỗi', 'Mẫu đã lưu không phải là JSON hợp lệ. Bắt đầu lại từ đầu.');
                        await AsyncStorage.removeItem('savedTemplate');
                    }
                } else {
                    console.log('Không có mẫu đã lưu.');
                }
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể tải mẫu đã lưu.');
                console.error('Lỗi khi tải mẫu:', error);
            }
        };

        loadData();
    }, []);


    const handleSelectTemplate = (template) => {
        console.log('Truyền dữ liệu đi', template);
        navigation.navigate('ContentSettings', { selectedTemplate: template });
    };


    return (
        <View style={styles.container}>
            <HeaderComponent
                title="Chọn mẫu"
                refreshText=""
                onBack={() => navigation.goBack()}
            />
            <View style={styles.containerselecttemplate}>
                <FlatList
                    data={templates}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleSelectTemplate(item)}>
                            <View style={styles.item}>
                                <Text style={styles.itemText}>{item}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text>No templates available</Text>}
                />

            </View>

        </View>
    );
};

export default SelectTemplateScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerselecttemplate: {
        padding: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    item: {
        padding: 15,
        backgroundColor: '#E8E8E8',
        marginBottom: 10,
        borderRadius: 5,
    },
    itemText: {
        fontSize: 18,
    },
});
