//
//  SafariExtensionViewController.m
//  octotree
//
//  Created by 野村 憲男 on 8/3/18.
//  Copyright © 2018 Norio Nomura. All rights reserved.
//

#import "SafariExtensionViewController.h"

@interface SafariExtensionViewController ()

@end

@implementation SafariExtensionViewController

+ (SafariExtensionViewController *)sharedController {
    static SafariExtensionViewController *sharedController = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedController = [[SafariExtensionViewController alloc] init];
        sharedController.preferredContentSize = NSMakeSize(320, 240);
    });
    return sharedController;
}

@end
