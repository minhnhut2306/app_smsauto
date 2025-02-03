import { NativeModules } from 'react-native';

const { CustomSmsModule } = NativeModules;

export const sendSms = async (phone, message, simSlot) => {
  try {
    const result = await CustomSmsModule.sendSms(phone, message, simSlot);
    console.log(result); // Log kết quả gửi tin nhắn
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};
