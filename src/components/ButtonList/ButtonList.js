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
  const toggleSwitch = () => setIsEnabled(prevState => !prevState);
  const toggleSwitchAlternating = () => {
    if (isSending) {
      Alert.alert("Bạn cần dừng gửi tin nhắn trước khi bật/tắt chế độ xen kẽ!");
      return;
    }
    setIsEnabledAlternating(prevState => !prevState);
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

  // Refs
  const smsCountRef = useRef(0);
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
      smsCountRef.current += 1;
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
    smsCountRef.current = 0;

    try {
      const phones = selectedOption.phones;
      const savedIndex = await getCurrentIndex(selectedSim);
      setCurrentIndex(savedIndex);
      sentPhones.current.clear();
      let currentSim = 0;

      for (let i = savedIndex; i < phones.length; i++) {
        if (isEnabled && smsCountRef.current >= smsLimit) {
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
        console.log(`Đã gửi ${smsCountRef.current} tin nhắn`);
        if (smsCountRef.current >= smsLimit) {
          Alert.alert('Đã đạt giới hạn tin nhắn!');
          break;
        }
        await new Promise(resolve => setTimeout(resolve, time * 1000));
        if (isEnabledAlternating) {
          currentSim = currentSim === 0 ? 1 : 0;
        }
      }
      console.log(`Tổng số tin nhắn đã gửi: ${smsCountRef.current}`);
      if (smsCountRef.current >= smsLimit) {
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
      Alert.alert(`Đã dừng gửi tin nhắn. Tin nhắn cuối cùng đã được gửi tới người dùng: ${lastSentName}`);
    } else {
      Alert.alert('Đã dừng gửi tin nhắn!');
    }

    await saveCurrentIndex(selectedSim, currentIndex);
  };
  const handleSaveTime = () => {
    dispatch(setTime(minutes));
    setModalVisible(false);
  };

  const handlelimitsms = () => {
    if (smsLimitInput && !isNaN(smsLimitInput)) {
      dispatch(setlimit(smsLimitInput));
      setLimitsms(false);
      Alert.alert(`Giới hạn tin nhắn đã được đặt thành ${smsLimitInput}`);
    } else {
      Alert.alert('Vui lòng nhập giới hạn hợp lệ!');
    }
  };

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
            <Text style={styles.smsLimitText}>{smsCountRef.current} / {smsLimit} SMS</Text>
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
