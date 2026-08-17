package com.shoutemapp

import android.app.Application
import androidx.multidex.MultiDexApplication
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost

//NativeModuleInjectionMark-mainApplication-import

class MainApplication : MultiDexApplication(), ReactApplication {
    //NativeModuleInjectionMark-mainApplication-body

    override val reactNativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
        //NativeModuleInjectionMark-mainApplication-rnhost-body

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override fun getPackages(): List<ReactPackage> {
            val packages: List<ReactPackage> = PackageList(this).packages.toMutableList().apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
              //NativeModuleInjectionMark-mainApplication-getPackages
            }

            return packages
        }

        override fun getJSMainModuleName(): String {
            return "index"
        }

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
    }

    override val reactHost: ReactHost
      get() = getDefaultReactHost(applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        loadReactNative(this)
        //NativeModuleInjectionMark-mainApplication-oncreate-end
    }
}
