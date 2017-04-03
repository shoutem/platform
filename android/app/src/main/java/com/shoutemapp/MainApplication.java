package com.shoutemapp;

import android.support.multidex.MultiDexApplication;

import com.facebook.react.ReactApplication;
import com.shoutem.calendar.CalendarManagerPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.avishayil.rnrestart.ReactNativeRestartPackage;
import com.idehub.GoogleAnalyticsBridge.GoogleAnalyticsBridgePackage;
import com.oblador.vectoricons.VectorIconsPackage;
import cl.json.RNSharePackage;
import com.microsoft.codepush.react.CodePush;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import com.facebook.CallbackManager;
import com.facebook.FacebookSdk;
import com.facebook.reactnative.androidsdk.FBSDKPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends MultiDexApplication implements ReactApplication {

  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

    @Override
    protected String getJSBundleFile() {
      return CodePush.getJSBundleFile();
    }

    @Override
    protected boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new CalendarManagerPackage(),
            new MapsPackage(),
            new ReactNativeRestartPackage(),
            new GoogleAnalyticsBridgePackage(),
            new VectorIconsPackage(),
            new RNSharePackage(),
            new CodePush(null, getApplicationContext(), BuildConfig.DEBUG),
            new FBSDKPackage(mCallbackManager)
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
      return mReactNativeHost;
  }

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    FacebookSdk.sdkInitialize(getApplicationContext());
  }
}
