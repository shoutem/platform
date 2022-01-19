#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

//NativeModuleInjectionMark-appDelegate-import

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"ShoutemApp"
                                            initialProperties:nil];

  //NativeModuleInjectionMark-appDelegate-applicationDidFinishLaunchingWithOptions

  if (@available(iOS 13.0, *)) {
      rootView.backgroundColor = [UIColor systemBackgroundColor];
  } else {
      rootView.backgroundColor = [UIColor whiteColor];
  }

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

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

//NativeModuleInjectionMark-appDelegate-body

@end
