# Awesome Screenshot Minus

This extension was created because I liked the original Awesome Screenshot extension by Diigo but could not trust it not to sell me out.
It has now been removed from the webstore, reportedly for user privacy violations -- all true. I found a lot of questionable stuff inside. 

If you are familiar with the original Awesome Screenshot, you'll feel right at home.

Here are the things I added, in addition to removing all the crap:

 ++ Desktop capture - used to be a "premium feature", i re-implemented it myself.
 ++ GDrive URL shortening - short "goo.gl/foo" urls for screenshots uploaded to GDrive.
 ++ (coming soon) Touch screen support.

 ** Less intrusive (minimum amount of code is injected into pages).

Get it in store: [here](https://chrome.google.com/webstore/detail/awesome-screenshot-minus/bnophbnknjcjnbadhhkciahanapffepm)

## PSA: Beta testers needed
Version 4.0 with touch screen support is coming, lots of changes made, no doubt something got broken. If you use this extension a lot (I don't) and would be willing to test please contact me at rojer@rojer.me.

Note on permissions:
  * all_urls: Required for shortcut-initiated captures to work, otherwise could be replaced with activeTab.
  * tabs: Required to get tab title and URL, could conceivably be replaced with additional
          round-trip to and from injected content script, but script injection
          itself already requires extensive permissions, so that's going backwards.
  * identity: For GDrive uploads.
  * identity.email: To display account name where the file is uploaded.
  * storage: To store options.
  * desktopCapture, notifications: for capturing desktop screenshots.
