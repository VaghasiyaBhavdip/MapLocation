package com.maplocation.BatteryStatus;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;
import android.os.PowerManager;
import android.content.Context;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class BatteryStatusModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext; // Add this line

    public BatteryStatusModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext; // Add this line
    }

    @Override
    public String getName() {
        return "BatteryStatus";
    }

    @ReactMethod
    public void isBatterySaverModeEnabled() {
        try {
            PowerManager powerManager = (PowerManager) reactContext.getSystemService(Context.POWER_SERVICE);
            boolean isPowerSaveMode = powerManager.isPowerSaveMode();
            sendEvent(isPowerSaveMode);
        } catch (Exception e) {
            sendEvent(false);
        }
    }

    private void sendEvent(boolean isPowerSaveMode) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("batteryOptimizationStatus", isPowerSaveMode);
    }
}
