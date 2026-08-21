//
//  AppDelegate.swift
//  ShoutemApp
//
//  Created by Slavko Stimac on 15.04.2025..
//  Copyright © 2025 Facebook. All rights reserved.
//


import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
//NativeModuleInjectionMark-appDelegate-import

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    //NativeModuleInjectionMark-appDelegate-applicationDidFinishLaunchingWithOptions

    factory.startReactNative(
      withModuleName: "ShoutemApp",
      in: window,
      launchOptions: launchOptions
    )

    //NativeModuleInjectionMark-appDelegate-applicationDidFinishLaunchingWithOptions-end

    return true
  }

  //NativeModuleInjectionMark-appDelegate-body
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
