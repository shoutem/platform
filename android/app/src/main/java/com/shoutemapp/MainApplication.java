package com.shoutemapp;

import android.support.multidex.MultiDexApplication;

import com.BV.LinearGradient.LinearGradientPackage;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactnative.photoview.PhotoViewPackage;
//NativeModuleInjectionMark-mainApplication-import

import java.util.Arrays;
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
            return Arrays.<ReactPackage>asList(
                //NativeModuleInjectionMark-mainApplication-getPackages
                new MainReactPackage(),
                new VectorIconsPackage(),
                new LinearGradientPackage(),
                new PhotoViewPackage()
            );
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
