/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

//NativeModuleInjectionMark-appDelegate-import

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;

  //NativeModuleInjectionMark-appDelegate-applicationDidFinishLaunchingWithOptions

  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"ShoutemApp"
                                               initialProperties: nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [UIColor whiteColor];

  // Loading view that shows the launch screen while Javascript is reloading
  UIView *loading = [[[NSBundle mainBundle] loadNibNamed:@"LaunchScreen" owner:self options:nil] objectAtIndex:0];
  rootView.loadingView = loading;
  // Allows the Javascript to render and avoids the white view flash, as described in:
  // https://github.com/facebook/react-native/issues/1402
  rootView.loadingViewFadeDelay = 2;
  loading.frame = self.window.bounds;

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  //NativeModuleInjectionMark-appDelegate-applicationDidFinishLaunchingWithOptions-end

  return YES;
}

//NativeModuleInjectionMark-appDelegate-body

@end
