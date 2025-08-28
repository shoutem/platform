#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
//NativeModuleInjectionMark-appDelegate-import

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"ShoutemApp";

  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  //NativeModuleInjectionMark-appDelegate-applicationDidFinishLaunchingWithOptions

  bool didFinish = [super application:application didFinishLaunchingWithOptions:launchOptions];
  //NativeModuleInjectionMark-appDelegate-applicationDidFinishLaunchingWithOptions-end

  return didFinish;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}
 
- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

//NativeModuleInjectionMark-appDelegate-body

@end
