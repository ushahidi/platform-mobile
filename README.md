# Ushahidi
## Mobile Apps

---

## Whitelabel

#### Interested in a whitelabel version of our app? Contact our [sales team](mailto:sales@ushahidi.com) for help or visit our [enterprise page](https://www.ushahidi.com/enterprise) for more information.

---

## GitHub
#### Clone the [Ushahidi](https://github.com/ushahidi/platform-mobile) repo

```
git clone git@github.com:ushahidi/platform-mobile.git Ushahidi_Mobile
cd Ushahidi_Mobile
```

## Secrets
#### Update the secrets with your own API keys

1. Rename `src/constants/secrets.ts.template` to `/src/constants/secrets.ts`
2. Get a Vimeo Access Token at https://developer.vimeo.com/apps
3. Get a MapBox Access Token at https://www.mapbox.com/studio/account/tokens/
4. Update `VIMEO_ACCESS_TOKEN` and `MAPBOX_ACCESS_TOKEN` with your own keys

---

## XCode
#### Ensure the latest [XCode](https://developer.apple.com/xcode/) is installed

Download and install XCode

```
https://developer.apple.com/xcode/
```

Once XCode is installed, install the command line tools

```
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcode-select --install
```

Check your version of GCC

```
gcc --version
```

---

## Homebrew
#### Ensure that [Homebrew](http://brew.sh) is installed

Install Homebrew, if its not already installed

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Add the Homebrew location `export PATH="/usr/local/bin:$PATH"` to your environment `$PATH`.

```
open -e ~/.bash_profile
```

Update the Homebrew recipes

```
brew update
```

If you have permission issues with `/usr/local/`, try running

```
sudo chown -R `whoami` /usr/local/
brew update
```

Check health of Homebrew recipes

```
brew doctor
```

---

## NPM
#### Ensure that [Node.js](https://nodejs.org) and [NPM](https://www.npmjs.com) is installed

Install Node via Homebrew

```
brew install node
```

Check the version of Node

```
node --version
```

Install some NPM utilities

```
npm install -g npm
```

Check the version of NPM

```
npm --version
```

Remove, Clean, Install
```
rm -rf node_modules/
npm cache clean
npm install
```

---

## Cordova
#### Install the latest [Cordova](https://www.npmjs.com/package/cordova)

Install the latest Cordova

```
npm install -g cordova@latest
```

If you run into permission problems, try using `sudo`

```
sudo npm install -g cordova@latest
```

Check the version of Cordova

```
cordova -v
```

Clean up the Cordova build files

```
cordova clean
```

---

## Ionic
#### Install the latest [Ionic](http://ionicframework.com/docs/) and necessary dependencies

Install the latest Ionic

```
npm install -g ionic@latest
```

If you run into permission problems, try using `sudo`

```
sudo npm install -g ionic@latest
```

Install some Ionic and Cordova utilities

```
npm install -g xcode@latest
npm install -g cordova-common@latest
npm install -g cordova-ios@latest
npm install -g cordova-android@latest
npm install -g cordova-browser@latest
sudo npm install -g ios-sim@latest
npm install -g ios-deploy@latest
npm install -g android-simulator@latest
```

Check the version of Ionic

```
ionic info
```

List the root level NPM packages

```
npm list --depth=0
```

To update the version of the ionic-angular package

```
npm install ionic-angular@latest --save --save-exact
npm install @ionic/app-scripts@latest --save-dev
```

Remove, Clean, Install
```
rm -rf node_modules/
npm cache clean
npm install
```

---

## Java
#### Ensure that [Java JDK](https://www.java.com/en) is installed on your machine

Download and install the latest [Java JDK](https://support.apple.com/kb/dl1572?locale=en_US)

```
https://support.apple.com/kb/dl1572?locale=en_US
```

Check your version of Java

```
java -version
```

---

## Android
#### Ensure the latest [Android](https://developer.android.com/index.html) is installed

Download and install the latest [Android Studio](https://developer.android.com/studio/index.html)

```
https://developer.android.com/studio/index.html
```

Once installed, find the location where the [Android SDK](https://developer.android.com/studio/command-line/index.html) is installed

```
Android Studio > Preferences > Appearance & Behaviour > System Settings > Android SDK > Android SDK Location
```

Open your `~/.bash_profile` to include the location of the [Android SDK](https://developer.android.com/studio/command-line/index.html)

```
open -e ~/.bash_profile
```

Add the lines to the bottom of your `~/.bash_profile`, pointing to your `Android SDK Location` (mine was `/Library/Android`)

```
export PATH=/Library/Android/tools:/Library/Android/platform-tools:$PATH
export ANDROID_HOME=/Library/Android
export ANDROID_SDK=/Library/Android
export ANDROID_SDK_ROOT=/Library/Android
```

Test running the [Android Command Line Tools](https://developer.android.com/studio/command-line/index.html)

```
android --help
```

Update the necessary SDKs

```
android list sdk --all --extended
android update sdk -u -a -t android-24
android update sdk -u -a -t extra-android-m2repository
android update sdk -u -a -t extra-google-google_play_services
android update sdk -u -a -t extra-google-analytics_sdk_v2
android update sdk -u -a -t extra-intel-Hardware_Accelerated_Execution_Manager
```

Run Android SDK Manager
```
android sdk
```

Run Android Virtual Device Manager
```
android avd
```

---

## iOS
#### Commands to [build](http://ionicframework.com/docs/v2/cli/build/) and [run](http://ionicframework.com/docs/v2/cli/run/) the iOS app

Check whether the Cordova requirements for iOS are installed

```
cordova requirements ios
```

Build the project for iOS

```
ionic cordova build ios
```

Run the app in the iOS Simulator or attached iOS device

```
ionic cordova run ios --livereload --consolelogs --serverlogs
```

Build the app in release and production mode for archiving

```
ionic cordova build ios --prod --release
```

More information on Cordova's [iOS Platform Guide](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/)

```
https://cordova.apache.org/docs/en/latest/guide/platforms/ios/
```

---

## Android
#### Commands to [build](http://ionicframework.com/docs/v2/cli/build/) and [run](http://ionicframework.com/docs/v2/cli/run/) the Android app

Check whether the Cordova requirements for Android are installed

```
cordova requirements android
```

Build the project for Android

```
ionic cordova build android
```

Run the app in the Android Emulator or attached Android device

```
ionic cordova run android --livereload --consolelogs --serverlogs
```

Build the app in release and production mode for archiving

```
ionic cordova build android --prod --release
```

More information on Cordova's [Android Platform Guide](https://cordova.apache.org/docs/en/latest/guide/platforms/android/)

```
https://cordova.apache.org/docs/en/latest/guide/platforms/android/
```

---

## Git
#### Commands for [Git](https://git-scm.com) version control

Check local changes

```
git status
```

Revert local changes

```
git reset --hard
```

Commit local changes

```
git add .
git add -u
git commit -m "message about the changes"
git push
```

Create a tag

```
git tag 1.0
git push origin --tags
```

---

## NPM
#### Some handy NPM commands

Check outdated NPM dependencies
```
npm outdated
```

Update all dependencies to latest Ionic
```
npm install ionic-angular@latest --save --save-exact
```


---

## Plugins
#### List of [Ionic Native plugins](http://ionicframework.com/docs/native/) used

```
ionic cordova plugin add cordova-plugin-app-version
npm install --save @ionic-native/app-version
```

```
ionic cordova plugin add cordova-plugin-camera
npm install --save @ionic-native/camera
```

```
ionic cordova plugin add cordova-plugin-device
npm install --save @ionic-native/device
```

```
ionic cordova plugin add cordova.plugins.diagnostic
npm install --save @ionic-native/diagnostic
```

```
ionic cordova plugin add cordova-plugin-file
npm install --save @ionic-native/file
```

```
ionic cordova plugin add cordova-plugin-filepath
npm install --save @ionic-native/file-path
```

```
ionic cordova plugin add cordova-plugin-file-transfer
npm install --save @ionic-native/file-transfer
```

```
ionic cordova plugin add cordova-plugin-geolocation
npm install --save @ionic-native/geolocation
```

```
ionic cordova plugin add cordova-plugin-google-analytics
npm install --save @ionic-native/google-analytics
```

```
ionic cordova plugin add cordova-plugin-is-debug
npm install --save @ionic-native/is-debug
```

```
ionic cordova plugin add cordova-plugin-media-capture
npm install --save @ionic-native/media-capture
```

```
ionic cordova plugin add cordova-plugin-nativegeocoder
npm install --save @ionic-native/native-geocoder
```

```
ionic cordova plugin add cordova-plugin-nativestorage
npm install --save @ionic-native/native-storage
```

```
ionic cordova plugin add cordova-plugin-network-information
npm install --save @ionic-native/network
```

```
ionic cordova plugin add cordova-plugin-x-socialsharing
npm install --save @ionic-native/social-sharing
```

```
ionic cordova plugin add cordova-plugin-splashscreen
npm install --save @ionic-native/splash-screen
```

```
ionic cordova plugin add cordova-sqlite-storage
npm install --save @ionic-native/sqlite
```

```
ionic cordova plugin add cordova-plugin-statusbar
npm install --save @ionic-native/status-bar
```

```
ionic cordova plugin add cordova-plugin-themeablebrowser
npm install --save @ionic-native/themeable-browser
```

```
ionic cordova plugin add ionic-plugin-deeplinks --variable URL_SCHEME=ushahidi --variable DEEPLINK_SCHEME=https --variable DEEPLINK_HOST=ushahidi.io --variable ANDROID_PATH_PREFIX=/
npm install --save @ionic-native/deeplinks
```

```
ionic cordova plugin add ionic-plugin-keyboard
npm install --save @ionic-native/keyboard
```
