# Awesome Screenshot Minus

Awesome Screenshot extension

 -- spyware and tracking crap

 ++ GDrive URL shortening

 ** Less intrusive (minimum amount of code is injected into pages).

https://chrome.google.com/webstore/detail/awesome-screenshot-minus/bnophbnknjcjnbadhhkciahanapffepm

Original: https://chrome.google.com/webstore/detail/awesome-screenshot-captur/alelhddbbhepgpmgidjdcjakblofbmce

Note on permissions:
  * all_urls: Required for shortcut-initiated captures to work, otherwise could be replaced with activeTab.
  * tabs: Required to get tab title and URL, could conceivably be replaced with additional
          round-trip to and from injected content script, but script injection
          itself already requires extensive permissions, so that's going backwards.
  * identity: For GDrive uploads.
  * identity.email: To display account name where the file is uploaded.
  * storage: To store options.
