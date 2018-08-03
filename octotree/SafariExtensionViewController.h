//
//  SafariExtensionViewController.h
//  octotree
//
//  Created by 野村 憲男 on 8/3/18.
//  Copyright © 2018 Norio Nomura. All rights reserved.
//

#import <SafariServices/SafariServices.h>

@interface SafariExtensionViewController : SFSafariExtensionViewController

+ (SafariExtensionViewController *)sharedController;

@end
