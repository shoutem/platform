package com.shoutemapp;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.ReactPackage;
import com.facebook.react.ReactInstanceManagerBuilder;

import java.lang.reflect.Method;
import java.util.Map;
import java.util.HashMap;
import android.util.Log;

public class PreviewModule extends ReactContextBaseJavaModule {
    private Activity activity;

    PreviewModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "Preview";
    }

    @ReactMethod
    public void reloadApp() {
        final Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            return;
        }

        currentActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                currentActivity.recreate();
            }
        });
    }

    @ReactMethod
    public void dismissApp() {
        getCurrentActivity().finish();
    }
}
