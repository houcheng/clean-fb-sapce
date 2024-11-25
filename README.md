# clean-fb-space

This is a tampermonkey script that runs as a chrome extension, hacks current running HTML DOM for removing AD blocks in facebook page.
It periodically poll the DOM, query the div id named as "FeedUnit_*" that indicates an standalone block, either a AD or a post in facebook,
then the script can filter the AD blocks by keywords like "Follow", "Join", etc. Finally, removes these AD blocks from the DOM.

### Install UsersSript Engine

- **_Chrome_** : Install [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **_Firefox_** : Install [GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
- **_Safari_** : Install [Tampermonkey](https://safari.tampermonkey.net/tampermonkey.safariextz)

### Install Script

- For desktop version, click [here](https://github.com/houcheng/CleanFBSapce/raw/master/src/cleanFb.user.js).
<!-- Not yet available 
- For android firefox version, click [here](https://github.com/houcheng/CleanFBSapce/raw/master/src/cleanFbMobile.user.js).
-->
