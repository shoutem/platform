package com.shoutemapp;

import android.os.Bundle;
import android.content.Intent;
import com.facebook.react.ReactActivity;
//NativeModuleInjectionMark-mainActivity-import

public class MainActivity extends ReactActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        //NativeModuleInjectionMark-mainActivity-onCreate
        super.onCreate(savedInstanceState);
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ShoutemApp";
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        //NativeModuleInjectionMark-mainActivity-onActivityResult
        super.onActivityResult(requestCode, resultCode, data);
        //NativeModuleInjectionMark-mainActivity-onActivityResult-end
    }
}
