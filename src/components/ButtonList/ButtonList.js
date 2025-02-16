import React, { useState, useEffect, useRef } from 'react';
import { View, Modal, Text, TextInput, TouchableOpacity, PermissionsAndroid, Switch, StyleSheet, Alert } from 'react-native';
import COLORS from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import ButtonComponent from '../Buttoncomponent/Buttoncomponenrt';
import { setTime } from '../../redux/reducers/timeReducer';
import { useDispatch, useSelector } from 'react-redux';
import fontsize from '../../constants/fontsize';
import { setlimit } from '../../redux/reducers/limitsmsReducer';
import { sendSms } from '../../redux/server/smsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ButtonList = ({ selectedSim, options }) => {
  // Redux state selectors
  const smsContent = useSelector(state => state.sms);
  const sms = smsContent?.smsContent || '';

  const timeInSeconds = useSelector(state => state.time) || 60;
  const time = parseInt(timeInSeconds?.timeInSeconds || 0, 10);
  const smsLimit = useSelector(state => state.limitsms.limitsms || 50);

  const toggleSwitch = async () => {
    if (isSending) {
      Alert.alert("Bạn cần dừng gửi tin nhắn trước khi bật/tắt chế độ giới hạn sms!");
      return;
    }
    setIsEnabled(prevState => {
      const newState = !prevState;
      if (!newState) {
        setSmsLimitInput('');
        dispatch(setlimit(50));
      }
      // Save the new state to AsyncStorage
      AsyncStorage.setItem('isEnabled', JSON.stringify(newState));
      return newState;
    });
  }

  const toggleSwitchAlternating = async () => {
    if (isSending) {
      Alert.alert("Bạn cần dừng gửi tin nhắn trước khi bật/tắt chế độ xen kẽ!");
      return;
    }
    setIsEnabledAlternating(prevState => {
      const newState = !prevState;
      // Save the new state to AsyncStorage
      AsyncStorage.setItem('isEnabledAlternating', JSON.stringify(newState));
      return newState;
    });
  };

  // React state hooks
  const [modalVisible, setModalVisible] = useState(false);
  const [modallimitsms, setLimitsms] = useState(false);
  const [smsLimitInput, setSmsLimitInput] = useState('');
  const [minutes, setMinutes] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isEnabledAlternating, setIsEnabledAlternating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastSentName, setLastSentName] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [smsCount, setSmsCount] = useState(0);

  // Refs
  const sentPhones = useRef(new Set());
  const isSendingRef = useRef(false);

  // Other hooks
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const requestPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      ]);

      if (
        granted[PermissionsAndroid.PERMISSIONS.SEND_SMS] !== PermissionsAndroid.RESULTS.GRANTED ||
        granted[PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE] !== PermissionsAndroid.RESULTS.GRANTED
      ) {
        Alert.alert("Ứng dụng cần quyền để gửi tin nhắn và truy cập thông tin SIM!");
        return false;
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };


  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsSending(false);
      isSendingRef.current = false;
      console.log("Bộ đếm đã dừng.");
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const saveCurrentIndex = async (sim, index) => {
    try {
      await AsyncStorage.setItem(`currentIndex_${sim}`, index.toString());
    } catch (error) {
      console.error('Lỗi lưu vị trí:', error);
    }
  };

  const getCurrentIndex = async (sim) => {
    try {
      const index = await AsyncStorage.getItem(`currentIndex_${sim}`);
      return index ? parseInt(index, 10) : 0;
    } catch (error) {
      console.error('Lỗi lấy vị trí:', error);
      return 0;
    }
  };

  const sendMessage = async (phone, sim) => {
    try {
      let message = sms;
      message = message.replace("{CMND}", phone.CMND);
      message = message.replace("{NOTE1}", phone.NOTE1);
      message = message.replace("{NOTE2}", phone.NOTE2);
      message = message.replace("{NOTE3}", phone.NOTE3);
      message = message.replace("{NOTE4}", phone.NOTE4);
      message = message.replace("{TEN}", phone.TEN);
      message = message.replace("{PHONE}", phone.phone);

      if (!message || message.trim().length === 0) {
        console.log("Tin nhắn rỗng. Dừng bộ đếm.");
        setIsSending(false);
        isSendingRef.current = false;
        setCountdown(0);
        Alert.alert("Chưa nhập nội dung tin nhắn!");
        await saveCurrentIndex(selectedSim, currentIndex);
        return;
      }

      console.log(`(LOG) Đang gửi tin nhắn tới ${phone.phone}: ${message} qua SIM ${sim + 1}`);
      await sendSms(phone.phone, message, sim);
      console.log('(SUCCESS) Tin nhắn đã được gửi:', phone.phone);
      setSmsCount(prevCount => {
        const newCount = prevCount + 1;
        console.log(`Updated SMS count: ${newCount}`);
        if (newCount >= smsLimit) {
          Alert.alert('Đã đạt giới hạn tin nhắn!');
          setIsSending(false);
          isSendingRef.current = false;
        }
        return newCount;
      });
      setLastSentName(phone.TEN);
    } catch (error) {
      console.error(`(ERROR) Lỗi gửi tin nhắn tới ${phone.phone}:`, error);
    }
  };

  const handleStartSending = async () => {
    if (isSending) {
      Alert.alert('Đang gửi tin nhắn! Hãy dừng trước khi bắt đầu lại.');
      return;
    }
    if (!selectedSim) {
      Alert.alert('Vui lòng chọn một loại SIM trước!');
      return;
    }

    const selectedOption = options.find(option => option.value === selectedSim);
    if (!selectedOption || selectedOption.phones.length === 0) {
      Alert.alert(`${selectedSim} không có số điện thoại nào để gửi.`);
      return;
    }

    setIsSending(true);
    isSendingRef.current = true;
    setSmsCount(0);

    try {
      const phones = selectedOption.phones;
      const savedIndex = await getCurrentIndex(selectedSim);
      setCurrentIndex(savedIndex);
      sentPhones.current.clear();
      let currentSim = 0;

      for (let i = savedIndex; i < phones.length; i++) {
        console.log(`Checking SMS limit: ${smsCount} / ${smsLimit}`);
        if (isEnabled && smsCount >= smsLimit) {
          Alert.alert('Đã đạt giới hạn tin nhắn!');
          break;
        }

        if (!isSendingRef.current) {
          console.log("Gửi tin nhắn đã bị dừng!");
          break;
        }

        const phone = phones[i];
        if (sentPhones.current.has(phone.phone)) {
          console.log(`Số điện thoại ${phone.phone} đã gửi rồi, bỏ qua.`);
          continue;
        }

        await sendMessage(phone, currentSim);
        if (!isSendingRef.current) {
          console.log("Quá trình gửi đã bị dừng, thoát khỏi vòng lặp.");
          break;
        }
        sentPhones.current.add(phone.phone);
        setCurrentIndex(i + 1);
        await saveCurrentIndex(selectedSim, i + 1);
        setCountdown(time);
        console.log(`Đã gửi ${smsCount + 1} tin nhắn`);
        if (smsCount + 1 >= smsLimit) {
          Alert.alert('Đã đạt giới hạn tin nhắn!');
          break;
        }
        await new Promise(resolve => setTimeout(resolve, time * 1000));
        if (isEnabledAlternating) {
          currentSim = currentSim === 0 ? 1 : 0;
        }
      }
      console.log(`Tổng số tin nhắn đã gửi: ${smsCount}`);
      if (smsCount >= smsLimit) {
        Alert.alert('Hoàn thành gửi tin nhắn!');
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
    } finally {
      setIsSending(false);
      isSendingRef.current = false;
    }
  };

  const handleStop = async () => {
    setIsSending(false);
    isSendingRef.current = false;
    setCountdown(0);

    if (lastSentName) {
      Alert.alert(`Đã dừng gửi tin nhắn ở ${lastSentName}`);
    } else {
      Alert.alert('Đã dừng gửi tin nhắn!');
    }

    await saveCurrentIndex(selectedSim, currentIndex);
  };

  const handleSaveTime = async () => {
    dispatch(setTime(minutes));
    setModalVisible(false);
    await AsyncStorage.setItem('timeInSeconds', minutes);
  };

  const handleRefresh = async () => {
    try {
      await AsyncStorage.clear();
      dispatch(setlimit(50));
      dispatch(setTime(60));
      setIsEnabled(false);
      setIsEnabledAlternating(false);
      setSmsCount(0);
      Alert.alert('Dữ liệu đã được làm mới!');
    } catch (error) {
      console.error('Lỗi khi làm mới dữ liệu:', error);
      Alert.alert('Lỗi khi làm mới dữ liệu, vui lòng thử lại!');
    }
  };

  const handlelimitsms = async () => {
    if (smsLimitInput && !isNaN(smsLimitInput)) {
      try {
        if (isSending) {
          Alert.alert('Đang gửi tin nhắn! Hãy dừng trước khi thay đổi giới hạn.');
          return;
        }
        await AsyncStorage.setItem('smsLimit', smsLimitInput.toString());
        dispatch(setlimit(parseInt(smsLimitInput, 10)));
        setLimitsms(false);
        Alert.alert(`Giới hạn tin nhắn đã được đặt thành ${smsLimitInput}`);
      } catch (error) {
        console.error('Lỗi khi lưu giới hạn SMS:', error);
        Alert.alert('Lỗi khi lưu dữ liệu, vui lòng thử lại!');
      }
    } else {
      Alert.alert('Vui lòng nhập giới hạn hợp lệ!');
    }
  };

  useEffect(() => {
    const getStoredSettings = async () => {
      try {
        const storedLimit = await AsyncStorage.getItem('smsLimit');
        if (storedLimit) {
          dispatch(setlimit(parseInt(storedLimit, 10)));
        }
        const storedTime = await AsyncStorage.getItem('timeInSeconds');
        if (storedTime) {
          dispatch(setTime(storedTime));
        }
        const storedSwitch = await AsyncStorage.getItem('isEnabled');
        if (storedSwitch !== null) {
          setIsEnabled(JSON.parse(storedSwitch));
        }
        const storedSwitchAlternating = await AsyncStorage.getItem('isEnabledAlternating');
        if (storedSwitchAlternating !== null) {
          setIsEnabledAlternating(JSON.parse(storedSwitchAlternating));
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ AsyncStorage:', error);
      }
    };

    getStoredSettings();
  }, []);

  const handleShowList = () => {
    if (!selectedSim) {
      Alert.alert('Vui lòng chọn một loại SIM trước!');
      return;
    }
    navigation.navigate('ShowList', { simType: selectedSim });
  };
  const buttons = [
    {
      title: 'Cài đặt nội dung',
      color: COLORS.silver,
      onPress: () => navigation.navigate('ContentSettings'),
    },
    {
      title: 'Cài đặt thời gian',
      color: COLORS.silver,
      onPress: () => setModalVisible(true),
    },
    {
      title: 'Hiện danh sách',
      color: COLORS.silver,
      onPress: handleShowList,
    },
    {
      title: 'Bắt đầu gửi',
      color: COLORS.red,
      textColor: '#fff',
      onPress: handleStartSending,
    },
    {
      title: 'Dừng',
      color: COLORS.silver,
      textColor: COLORS.red,
      onPress: handleStop,
    },
    {
      title: 'Làm mới lại trạng thái dữ liệu',
      color: COLORS.red,
      textColor: '#fff',
      onPress: handleRefresh,
    },
  ];

  return (
    <View>
      {buttons.map((button, index) => (
        <ButtonComponent
          key={index}
          title={button.title}
          onPress={button.onPress}
          color={button.color}
          textColor={button.textColor || COLORS.black}
          widthPercentage={90}
        />
      ))}
      {isSending && countdown > 0 && (
        <Text style={{ textAlign: 'center', marginTop: 10, color: COLORS.red }}>
          Tin nhắn tiếp theo sẽ được gửi sau: {countdown} giây
        </Text>
      )}

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Giới hạn SMS</Text>
        <Switch
          trackColor={{ false: COLORS.gray, true: COLORS.gray }}
          thumbColor={isEnabled ? COLORS.red : COLORS.white}
          onValueChange={toggleSwitch}
          value={isEnabled}
          style={{ marginStart: 10 }}
        />
        {isEnabled && (
          <View style={styles.switchContainer}>
            <Text style={styles.smsLimitText}>{smsCount} / {smsLimit} SMS</Text>
            <ButtonComponent
              title="Nhập"
              color={COLORS.red}
              textColor={COLORS.white}
              widthPercentage={30}
              onPress={() => setLimitsms(true)}
            />
          </View>
        )}
      </View>
      <View style={styles.switchContainer}>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Gửi 2 sim xen kẻ</Text>
          <Switch
            trackColor={{ false: COLORS.gray, true: COLORS.gray }}
            thumbColor={isEnabledAlternating ? COLORS.red : COLORS.white}
            onValueChange={toggleSwitchAlternating}
            value={isEnabledAlternating}
            style={{ marginStart: 10 }}
          />
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              width: 300,
              padding: 20,
              backgroundColor: COLORS.white,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 16, marginBottom: 10 }}>Nhập thời gian (giây):</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: COLORS.silver,
                padding: 10,
                marginBottom: 20,
                borderRadius: 5,
              }}
              keyboardType="numeric"
              value={minutes}
              onChangeText={setMinutes}
              placeholder="Nhập số giây"
            />
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.red,
                padding: 10,
                borderRadius: 5,
                alignItems: 'center',
              }}
              onPress={handleSaveTime}
            >
              <Text style={{ color: COLORS.white }}>Lưu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                marginTop: 10,
                alignItems: 'center',
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: COLORS.black }}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modallimitsms} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Cài đặt giới hạn SMS</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập giới hạn SMS"
              keyboardType="numeric"
              value={smsLimitInput}
              onChangeText={setSmsLimitInput}
            />
            <ButtonComponent
              title="Lưu"
              onPress={handlelimitsms}
              color={COLORS.red}
              textColor={COLORS.white}
            />
            <TouchableOpacity
              style={{
                marginTop: 10,
                alignItems: 'center',
              }}
              onPress={() => setLimitsms(false)}
            >
              <Text style={{ color: COLORS.black }}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: fontsize.md,
    fontWeight: 'bold',
  },
  smsLimitContainer: {
    backgroundColor: COLORS.lightgrey,
    padding: 5,
    borderRadius: 5,
  },
  smsLimitText: {
    fontSize: fontsize.h3,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 5,
    marginBottom: 10,
    width: 300,
    paddingLeft: 10,
  }
});

export default ButtonList;