package com.shoutemapp;

import android.os.Bundle;
import android.content.Intent;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
//NativeModuleInjectionMark-mainActivity-import

public class MainActivity extends ReactActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        //NativeModuleInjectionMark-mainActivity-onCreate
        super.onCreate(savedInstanceState);
    }

    @Override
    public void invokeDefaultOnBackPressed() {
        // do not call super. invokeDefaultOnBackPressed() as it will close the app.  Instead lets just put it in the background.
        moveTaskToBack(true);
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

    /**
     * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
     * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
     * (aka React 18) with two boolean flags.
     */
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
      return new DefaultReactActivityDelegate(
          this,
          getMainComponentName(),
          // If you opted-in for the New Architecture, we enable the Fabric Renderer.
          DefaultNewArchitectureEntryPoint.getFabricEnabled());
    }
  }
