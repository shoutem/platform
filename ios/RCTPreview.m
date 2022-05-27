#import "RCTPreview.h"
#import "AppDelegate.h"
#import <React/RCTBridge.h>
#import <React/RCTReloadCommand.h>
#import <React/RCTRootView.h>

@implementation RCTPreview

RCT_EXPORT_MODULE();

+ (nullable UIViewController *) getPreviewRootViewController
{
   AppDelegate *application = (AppDelegate *)[UIApplication sharedApplication].delegate;
   return application.window.rootViewController;

}

+ (nullable UIViewController *) getPreviewedAppViewController
{
  UIViewController *appRootViewController = [self getPreviewRootViewController];
  return [appRootViewController presentedViewController];
}

+ (nullable RCTBridge *) getPreviewedAppBridge
{
  UIViewController *appPresentedViewController = [self getPreviewedAppViewController];
  if (appPresentedViewController) {
    RCTRootView *previewedAppView = (RCTRootView *)[appPresentedViewController view];
    return [previewedAppView bridge];
  }
  return nil;
}

+ (void) dismissPreviewPresentedController {
  UIViewController *appRootViewController = [[self class] getPreviewRootViewController];
  [appRootViewController dismissViewControllerAnimated:YES
                                            completion:nil];
}

RCT_EXPORT_METHOD(reloadApp)
{
  RCTBridge *bridge = [[RCTPreview class] getPreviewedAppBridge];
  if (bridge) {
    RCTTriggerReloadCommandListeners(@"");
  }
}

RCT_EXPORT_METHOD(dismissApp)
{
   NSLog(@"dismiss");
   dispatch_async(dispatch_get_main_queue(), ^(void) {
    NSLog(@"dispatch_async");
    AppDelegate *application = (AppDelegate *)[UIApplication sharedApplication].delegate;
     UIViewController *rootViewController = (AppDelegate *)[UIApplication sharedApplication].keyWindow.rootViewController;

     NSLog(@"WINDOWS %@", [[UIApplication sharedApplication] windows]);
     NSLog(@"objectAtIndex 0 %@",  [[[UIApplication sharedApplication] windows] objectAtIndex:0]);
     NSLog(@"objectAtIndex 1 %@",  [[[UIApplication sharedApplication] windows] objectAtIndex:1]);

    [rootViewController dismissViewControllerAnimated:YES completion:nil];
  });
}

@end
