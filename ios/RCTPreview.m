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
  dispatch_async(dispatch_get_main_queue(), ^(void) {
    AppDelegate *application = (AppDelegate *)[UIApplication sharedApplication].delegate;
    UIViewController *rootViewController = application.window.rootViewController;
    UIViewController *previewController = rootViewController.presentedViewController;

    [previewController dismissViewControllerAnimated:YES
                                              completion:nil];
  });
}

@end
