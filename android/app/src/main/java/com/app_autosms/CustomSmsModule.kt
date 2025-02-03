package com.app_autosms

import android.Manifest
import androidx.core.content.ContextCompat
import android.content.Context
import android.content.pm.PackageManager
import android.telephony.SmsManager
import android.telephony.SubscriptionManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class CustomSmsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val context: Context = reactContext

    override fun getName(): String {
        return "CustomSmsModule"
    }

    @ReactMethod
    fun sendSms(phoneNumber: String, message: String, simSlot: Int, promise: Promise) {
    try {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED) {
            val subscriptionManager = context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager
            val subscriptionInfoList = subscriptionManager.activeSubscriptionInfoList
            val subscriptionInfo = subscriptionInfoList?.find { it.simSlotIndex == simSlot }

            if (subscriptionInfo != null) {
                val subscriptionId = subscriptionInfo.subscriptionId
                val smsManager = SmsManager.getSmsManagerForSubscriptionId(subscriptionId)
                smsManager.sendTextMessage(phoneNumber, null, message, null, null)
                promise.resolve("Tin nhắn đã được gửi qua SIM ${simSlot + 1}")
            } else {
                promise.reject("ERROR_SENDING_SMS", "Không tìm thấy SIM phù hợp")
            }
        } else {
            promise.reject("ERROR_SENDING_SMS", "Ứng dụng chưa được cấp quyền READ_PHONE_STATE")
        }
    } catch (e: Exception) {
        promise.reject("ERROR_SENDING_SMS", e)
    }
}


}
