package com.shoutemapp;

import androidx.multidex.MultiDexApplication;
import android.content.Context;

import com.facebook.react.PackageList;
import com.facebook.hermes.reactexecutor.HermesExecutorFactory;
import com.facebook.react.bridge.JavaScriptExecutorFactory;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import java.lang.reflect.InvocationTargetException;
//NativeModuleInjectionMark-mainApplication-import

import java.util.List;

public class MainApplication extends MultiDexApplication implements ReactApplication {
    //NativeModuleInjectionMark-mainApplication-body

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        //NativeModuleInjectionMark-mainApplication-rnhost-body

        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          //NativeModuleInjectionMark-mainApplication-getPackages

          return packages;
        }
    };

    protected String getJSMainModuleName() {
        return "index";
    }

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        //NativeModuleInjectionMark-mainApplication-oncreate-end

    }
}
