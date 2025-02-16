import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import * as XLSX from 'xlsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DocumentPicker from 'react-native-document-picker';
import ButtonComponent from '../../../components/Buttoncomponent/Buttoncomponenrt';
import HeaderComponent from '../../../components/HeaderComponent/HeaderComponent';
import RadioButton from '../../../components/RadioButton/RadioButton';
import ButtonList from '../../../components/ButtonList/ButtonList';
import { useNavigation } from '@react-navigation/native';
import fontsize from '../../../constants/fontsize';
import COLORS from '../../../constants/colors';
import RNFS from 'react-native-fs';
import { useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ImageBackground } from 'react-native';
import { FileSystem } from 'react-native-unimodules';
import { resetStore } from '../../../redux/reducers/resetActions';


const SmsScreens = () => {
  const [selected, setSelected] = useState('');
  const smsContent = useSelector(state => state.sms);
  console.log('smsContent', smsContent);
  const timeInSeconds = useSelector(state => state.time) || 60;
  const time = timeInSeconds?.timeInSeconds;
  console.log('time', time);
  const [options, setOptions] = useState([
    { label: 'Mobifone', value: 'Mobi', count: 0, phones: [] },
    { label: 'Viettel', value: 'Viettel', count: 0, phones: [] },
    { label: 'Vinaphone', value: 'Vina', count: 0, phones: [] },
  ]);
  const dispatch = useDispatch();

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const handleRefresh = () => {
    Alert.alert('Thông báo', 'Đang làm mới dữ liệu...');
  };

  useEffect(() => {
    loadStoredOptions();
  }, []);

  const saveOptionsToStorage = async (data) => {
    try {
      await AsyncStorage.setItem('options', JSON.stringify(data));
      console.log('Dữ liệu đã được lưu vào AsyncStorage');
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu vào AsyncStorage:', error);
    }
  };

  const saveSheetDataToStorage = async (data) => {
    try {
      await AsyncStorage.setItem('sheetData', JSON.stringify(data));
      console.log('Dữ liệu sheet đã được lưu vào AsyncStorage');
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu sheet vào AsyncStorage:', error);
    }
  };

  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log('AsyncStorage đã được xóa sạch.');
    } catch (error) {
      console.error('Lỗi khi xóa AsyncStorage:', error);
    }
  };

  const resetLocalState = () => {
    setSelected('');
    setOptions([
      { label: 'Mobifone', value: 'Mobi', count: 0, phones: [] },
      { label: 'Viettel', value: 'Viettel', count: 0, phones: [] },
      { label: 'Vinaphone', value: 'Vina', count: 0, phones: [] },
    ]);
  };


  const clearInternalStorage = async () => {
    try {
      const dirPath = RNFS.DocumentDirectoryPath; // Thư mục chính của app
      const files = await RNFS.readDir(dirPath);
      for (const file of files) {
        await RNFS.unlink(file.path);
      }
      console.log('Đã xóa toàn bộ dữ liệu bộ nhớ trong.');
    } catch (error) {
      console.error('Lỗi khi xóa dữ liệu bộ nhớ trong:', error);
    }
  };
  
  const handleResetStore = () => {
    dispatch(resetStore());
    console.log('Redux store đã được reset!');
  };



  const handleResetAllData = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu không? Điều này sẽ đặt lại ứng dụng như khi mới cài đặt.',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đồng ý',
          onPress: async () => {
            try {
              handleResetStore();

              await clearAsyncStorage();

              await clearInternalStorage();

              resetLocalState();

              Alert.alert('Thông báo', 'Toàn bộ dữ liệu đã được xóa.');
            } catch (error) {
              console.error('Lỗi khi reset toàn bộ dữ liệu:', error);
            }
          },
        },
      ],
    );
  };



  const loadStoredOptions = async () => {
    try {
      console.log('Bắt đầu tải dữ liệu từ AsyncStorage...');
      const storedOptions = await AsyncStorage.getItem('options');

      console.log('Stored options raw:', storedOptions);

      if (storedOptions) {
        const parsedOptions = JSON.parse(storedOptions);
        console.log('Stored options parsed:', parsedOptions);

        setOptions(parsedOptions);
        console.log('Dữ liệu đã được tải từ AsyncStorage và set vào state');
      } else {
        console.log('Không tìm thấy dữ liệu trong AsyncStorage');
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu từ AsyncStorage:', error);
    }
  };

  const handleLoadExcel = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls],
      });
      if (result) {
        const fileUri = result[0].uri;
        const fileData = await RNFS.readFile(fileUri, 'base64');
        const workbook = XLSX.read(fileData, { type: 'base64' });
        const sheetName = workbook.SheetNames[0];
        console.log('Sheet name:', sheetName);
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

        jsonData.forEach((row, rowIndex) => {
          Object.keys(row).forEach((key) => {
            const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: key.charCodeAt(0) - 65 });
            const cell = sheet[cellAddress];
            if (cell && cell.c) {
              row[`${key}_NOTE`] = cell.c.map((comment) => comment.t).join('; ');
            }
          });
        });

        console.log('Dữ liệu đã đọc từ file:', jsonData);
        const categorizedOptions = categorizePhoneNumbers(jsonData);
        setOptions(categorizedOptions);
        saveOptionsToStorage(categorizedOptions);
        await saveSheetDataToStorage(jsonData);

        if (isFocused) {
          setTimeout(() => {
            Alert.alert('Thông báo', 'Tải file Excel thành công!');
          }, 0);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải file Excel:', error);
      if (isFocused) {
        setTimeout(() => {
          Alert.alert('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại.');
        }, 0);
      }
    }
  };

  const handleRadioSelect = (value) => {
    setSelected(value);
    const selectedOption = options.find(option => option.value === value);
    if (selectedOption) {
      console.log(`Danh sách số điện thoại của ${value}:`, selectedOption.phones);
    }
    Alert.alert('Thông báo', `Bạn đã chọn nhà mạng: ${value}`);
  };


  const categorizePhoneNumbers = (data) => {
    const phoneRegex = {
      Mobi: /^(090|093|089|070|076|077|078|079)/,
      Viettel: /^(098|097|096|086|032|033|034|035|036|037|038|039)/,
      Vina: /^(091|094|088|081|082|083|084|085|087)/,
    };

    const updatedOptions = [
      { label: 'Mobifone', value: 'Mobi', count: 0, phones: [] },
      { label: 'Viettel', value: 'Viettel', count: 0, phones: [] },
      { label: 'Vinaphone', value: 'Vina', count: 0, phones: [] },
    ];

    data.forEach((row) => {
      let phone = row.PHONE?.toString().trim();
      if (phone && phone.length < 10) {
        phone = phone.padStart(10, '0');
      }
      if (phone) {
        const { PHONE, ...otherFields } = row;
        const phoneData = { ...otherFields, phone };
        console.log('data: ', phoneData);
        if (phoneRegex.Mobi.test(phone)) {
          updatedOptions[0].count++;
          updatedOptions[0].phones.push(phoneData);
        } else if (phoneRegex.Viettel.test(phone)) {
          updatedOptions[1].count++;
          updatedOptions[1].phones.push(phoneData);
        } else if (phoneRegex.Vina.test(phone)) {
          updatedOptions[2].count++;
          updatedOptions[2].phones.push(phoneData);
        } else {
          console.log(`${phone} không thuộc nhà mạng nào`);
        }
      }
    });

    return updatedOptions;
  };

  return (
    <View
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderComponent title="Auto SMS" onRefresh={handleRefresh} refreshText="" />
        <View style={styles.body}>
          <ButtonComponent
            title="LOAD FILE XLS"
            onPress={handleLoadExcel}
            color="#28a745"
            widthPercentage={90}
          />
          <ButtonComponent
            title="Nhập dữ liệu tay"
            onPress={() => navigation.navigate('EnterByhand')}
            color={COLORS.azureblue}
            widthPercentage={90}
          />
          <View style={styles.radioGroup}>
            {options.map((option) => (
              <RadioButton
                key={option.value}
                option={option}
                selected={selected}
                onSelect={handleRadioSelect}
              />
            ))}
          </View>

          <ButtonList selectedSim={selected} options={options} />
          <View style={styles.switchContainer}>
            <Text>
              Thời gian gửi tin nhắn: {minutes} phút {seconds} giây
            </Text>
          </View>
          <ButtonComponent
            title="Xóa Tất Cả Dữ Liệu"
            onPress={handleResetAllData}
            color="#dc3545"
            widthPercentage={90}
          />

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Căn giữa các phần tử nếu cần
    alignItems: 'center', // Căn giữa theo chiều ngang
  },
  body: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    padding: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10,
    alignSelf: 'flex-start',
  },
});

export default SmsScreens;
