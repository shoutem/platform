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
class AppDelegate: RCTAppDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    self.moduleName = "ShoutemApp"
    self.dependencyProvider = RCTAppDependencyProvider()
 
    // You can add your custom initial props in the dictionary below.
    // They will be passed down to the ViewController used by React Native.
    self.initialProps = [:]
    
    //NativeModuleInjectionMark-appDelegate-applicationDidFinishLaunchingWithOptions
    let didFinish = super.application(application, didFinishLaunchingWithOptions: launchOptions)
    //NativeModuleInjectionMark-appDelegate-applicationDidFinishLaunchingWithOptions-end
    return didFinish
  }
 
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
  
  //NativeModuleInjectionMark-appDelegate-body
}
