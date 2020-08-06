#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
//NativeModuleInjectionMark-appDelegateHeader-import

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>

@property (nonatomic, strong) UIWindow *window;

@end
