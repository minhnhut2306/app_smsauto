import { StyleSheet, Text, View, Alert, ImageBackground } from 'react-native';
import React, { useState, useEffect } from 'react';
import HeaderComponent from '../../../components/HeaderComponent/HeaderComponent';
import InputComponent from '../../../components/Inputcomponent/Inputcomponent';
import ButtonComponent from '../../../components/Buttoncomponent/Buttoncomponenrt';
import { useDispatch, useSelector } from 'react-redux';
import { setSmsContent } from '../../../redux/reducers/smsReducer';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';

const ContentSettingsScreen = ({ route }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const smsContent = useSelector(state => state.smsContent);
    const { selectedTemplate } = route.params || {};
    console.log('selectedTemplate', selectedTemplate);
    const [temporaryContent, setTemporaryContent] = useState('');
    console.log('temporary content', temporaryContent);

    const [isContentApplied, setIsContentApplied] = useState(false);
    const [randomItem, setRandomItem] = useState(null);

    const replaceContentWithValues = (content, item) => {
        let result = content;
        if (item) {
            result = result.replace(/{TEN}/g, item.TEN || '');
            result = result.replace(/{PHONE}/g, item.PHONE || '');
            result = result.replace(/{NOTE1}/g, item.NOTE1 || '');
            result = result.replace(/{NOTE2}/g, item.NOTE2 || '');
            result = result.replace(/{NOTE3}/g, item.NOTE3 || '');
            result = result.replace(/{NOTE4}/g, item.NOTE4 || '');
        }

        return result;
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const storedData = await AsyncStorage.getItem('sheetData');
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    console.log('Parsed Data:', parsedData);

                    const firstItem = parsedData[0];
                    console.log('First Item:', firstItem);
                    setRandomItem(firstItem);
                } else {
                    console.log('Không có dữ liệu lưu trữ');
                }
            } catch (error) {
                Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải dữ liệu.');
                console.error('Error loading data:', error);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        setTemporaryContent('');
    }, [smsContent]);

    useEffect(() => {
        if (selectedTemplate) {
            setTemporaryContent(selectedTemplate);
        }
    }, [selectedTemplate]);

    const handleApplyContent = () => {
        if (temporaryContent) {
            const appliedContent = replaceContentWithValues(temporaryContent);
            console.log('applyContent', appliedContent);

            dispatch(setSmsContent(appliedContent));
            setIsContentApplied(true);
            Alert.alert('Thông báo', 'Nội dung đã được áp dụng.');
        } else {
            Alert.alert('Lỗi', 'Vui lòng nhập nội dung trước khi áp dụng.');
        }
    };

    const handleSaveTemplate = async () => {
        if (temporaryContent) {
            try {
                const storedTemplates = await AsyncStorage.getItem('savedTemplate');

                let templates = [];
                if (storedTemplates) {
                    try {
                        templates = JSON.parse(storedTemplates);
                    } catch (error) {
                        console.error('Lỗi khi phân tích dữ liệu đã lưu:', error);
                        Alert.alert('Lỗi', 'Dữ liệu đã lưu bị hỏng, bắt đầu lại từ đầu.');
                        await AsyncStorage.removeItem('savedTemplate');
                        templates = [];
                    }
                }
                templates.push(temporaryContent);
                await AsyncStorage.setItem('savedTemplate', JSON.stringify(templates));
                Alert.alert('Thông báo', 'Mẫu đã được lưu thành công.');
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể lưu mẫu.');
                console.error('Lỗi khi lưu mẫu:', error);
            }
        } else {
            Alert.alert('Lỗi', 'Vui lòng nhập nội dung trước khi lưu.');
        }
    };

    const handleCopy = (content) => {
        Clipboard.setString(content);
        Alert.alert('Thông báo', 'Nội dung đã được sao chép');
    };
    const handleRefresh = () => {
        const newContent = '';
        setTemporaryContent(newContent);
        navigation.navigate('SelectTemplate');
    };

    return (
        <View
             style={styles.container}
           >
            <HeaderComponent
                title="Cài đặt nội dung"
                refreshText="Chọn mẫu"
                onBack={() => navigation.goBack()}
                onRefresh={handleRefresh}
            />
            <View style={styles.containercontent}>
                <View style={styles.contentContainer}>
                    <Text style={styles.tenTitle}>{`{TEN}`}</Text>
                    <Text style={styles.title}>{randomItem?.TEN || ''}</Text>

                    <ButtonComponent
                        title="Copy"
                        onPress={() => handleCopy(`{TEN}` || 'N/A')}
                        color="#007bff"
                        widthPercentage={44}
                        style={styles.button}
                    />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.tenTitle}>{`{PHONE}`}</Text>
                    <Text style={styles.title}>{randomItem?.PHONE ? 0 + randomItem?.PHONE : ''}</Text>
                    <ButtonComponent
                        title="Copy"
                        onPress={() => handleCopy(`{PHONE}` || 'N/A')}
                        color="#007bff"
                        widthPercentage={44}
                        style={styles.button}
                    />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.tenTitle}>{`{NOTE1}`}</Text>
                    <Text style={styles.title}>{randomItem?.NOTE1 || ''}</Text>
                    <ButtonComponent
                        title="Copy"
                        onPress={() => handleCopy(`{NOTE1}` || 'N/A')}
                        color="#007bff"
                        widthPercentage={44}
                        style={styles.button}
                    />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.tenTitle}>{`{NOTE2}`}</Text>
                    <Text style={styles.title}>{randomItem?.NOTE2 || ''}</Text>
                    <ButtonComponent
                        title="Copy"
                        onPress={() => handleCopy(`{NOTE2}` || 'N/A')}
                        color="#007bff"
                        widthPercentage={44}
                        style={styles.button}
                    />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.tenTitle}>{`{NOTE3}`}</Text>
                    <Text style={styles.title}>{randomItem?.NOTE3 || ''}</Text>
                    <ButtonComponent
                        title="Copy"
                        onPress={() => handleCopy(`{NOTE3}` || 'N/A')}
                        color="#007bff"
                        widthPercentage={44}
                        style={styles.button}
                    />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.tenTitle}>{`{NOTE4}`}</Text>
                    <Text style={styles.title}>{randomItem?.NOTE4 || ''}</Text>
                    <ButtonComponent
                        title="Copy"
                        onPress={() => handleCopy(`{NOTE4}` || 'N/A')}
                        color="#007bff"
                        widthPercentage={44}
                        style={styles.button}
                    />
                </View>
            </View>

            <InputComponent
                placeholder="Nhập nội dung SMS"
                widthPercentage={90}
                value={temporaryContent}
                onChangeText={setTemporaryContent}
            />
            <View style={styles.buttonContainer}>
                <ButtonComponent
                    title="Áp dụng"
                    onPress={handleApplyContent}
                    color="#007bff"
                    widthPercentage={44}
                    style={styles.button}
                />
                <ButtonComponent
                    title="Lưu mẫu"
                    onPress={handleSaveTemplate}
                    color="#007bff"
                    widthPercentage={44}
                    style={styles.button}
                />
            </View>
            {isContentApplied && (
                <Text style={styles.text}>
                    {replaceContentWithValues(temporaryContent, randomItem)}
                </Text>
            )}
        </View>
    );
};

export default ContentSettingsScreen;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        alignItems: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        marginTop: 20,
    },
    button: {
        marginRight: 5,
    },
    text: {
        marginTop: 20,
        fontSize: 16,
        color: '#000',
        padding: 10,
        borderRadius: 5,
        textAlign: 'center',
    },
    containercontent: {
        width: '100%',
        paddingHorizontal: 10,
    },
    contentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
});
