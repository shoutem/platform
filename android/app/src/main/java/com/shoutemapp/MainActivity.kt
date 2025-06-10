package com.shoutemapp;

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
//NativeModuleInjectionMark-mainActivity-import

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
      //NativeModuleInjectionMark-mainActivity-onCreate
      super.onCreate(savedInstanceState)
  }

  override fun invokeDefaultOnBackPressed() {
      // do not call super.invokeDefaultOnBackPressed() as it will close the app.
      // Instead, just put the app in the background.
      moveTaskToBack(true)
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "ShoutemApp"

  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    //NativeModuleInjectionMark-mainActivity-onActivityResult
    super.onActivityResult(requestCode, resultCode, data)
    //NativeModuleInjectionMark-mainActivity-onActivityResult-end
  }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
