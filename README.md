# Ushahidi
## Mobile Apps

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
npm install -g ios-sim@latest
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
ionic build ios
```

Run the app in the iOS Simulator or attached iOS device

```
ionic run ios --livereload --consolelogs --serverlogs
```

If you get the error `Error: Cannot read property 'replace' of undefined` when trying to run the app, try [running the command](https://stackoverflow.com/a/44580372/385730) from the project folder.

```
cd platforms/ios/cordova && npm install ios-sim
```

Build the app in release and production mode for archiving

```
ionic build ios --prod --release
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
ionic build android
```

Run the app in the Android Emulator or attached Android device

```
ionic run android --livereload --consolelogs --serverlogs
```

Build the app in release and production mode for archiving

```
ionic build android --prod --release
```

More information on Cordova's [Android Platform Guide](https://cordova.apache.org/docs/en/latest/guide/platforms/android/)

```
https://cordova.apache.org/docs/en/latest/guide/platforms/android/
```

---

## Whitelabel
#### Instructions for creating a whitelabel version of the app

##### Need help creating a whitelabel app? Contact our [sales team](mailto:sales@ushahidi.com) for help or visit our [enterprise page](https://www.ushahidi.com/enterprise) for more information.

Duplicate existing whitelabel project settings

* copy `projects/whitelabel.json` and rename file, for example `projects/myapp.json`

Duplicate existing whitelabel project folder

* copy `projects/whitelabel` and rename folder, for example `projects/myapp`
* replace `projects/myapp/icon.png` with your own _1024 × 1024_ app icon
* replace  `projects/myapp/splash.png` with your own _2208 × 2208_ splash screen

Edit the app id, name, description and images

* `appId` - bundle id of the app
* `appName` - display name of the app
* `appDescription` - description of the app
* `appIcon` - path to your app icon image, for example `projects/myapp/icon.png`
* `appSplash` - path to your app splash screen image, for example `projects/myapp/splash.png`
* `appLanguages` - subset of languages you want to include

Edit the app color codes

* `colorNavbar` - top navbar color code
* `colorToolbar` - bottom toolbar color code
* `colorPrimary` - button color for primary actions
* `colorSecondary` - button color for secondary actions
* `colorDark` - text color for titles and headings
* `colorLight` - text color for descriptions and paragraphs
* `colorDanger` - text color for errors or background color remove buttons
* `colorActive` - text color for active list items
* `colorHighlight` - background color for active list items

Edit the [deep links](https://github.com/ionic-team/ionic-plugin-deeplinks) configuration for the app

* `deepLinkSecure` - either `http` or `https` depending if your deployment supports SSL
* `deepLinkDomain` - domain of your deployment without the `http://` or `https://`
* `deepLinkProtocol` - custom protocol to launch the app, for example `ushahidi://`

Edit additional app configuration settings

* `userSignupPhone` - `true` or `false` whether you want to show phone number on user signup

Enter the [custom deployment](https://www.ushahidi.com) URL

* `deploymentUrl` - URL to your custom deployment
* `deploymentEmail` - support email for the custom deployment

Remove the existing Cordova platforms

* `ionic platform rm ios`
* `ionic platform rm android`

Add iOS and Android platforms

* `project=myapp ionic platform add ios`
* `project=myapp ionic platform add android`

Good news, your whitelabel app should now be setup!

---
#### Build & Run

Build and compile your apps

* `project=myapp ionic build ios`
* `project=myapp ionic build android`

Run and debug your apps

* `project=myapp ionic run ios --livereload --consolelogs --serverlogs`
* `project=myapp ionic run android --livereload --consolelogs --serverlogs`

---
#### iOS Release

Prepare iOS app for release [using parameters](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/#signing-an-app)

* `project=myapp ionic build ios --device --prod --release --developmentTeam="ABCD" --codeSignIdentity="iPhone Developer" --provisioningProfile="UUID"`

Or prepare iOS app for release using [build config](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/#using-buildjson)

* `ionic build ios --device --prod --release --buildConfig=projects/myapp/build.json`

Upload your IPA to the App Store

* open `platforms/ios/MyApp.xcworkspace`
* select `Product` then `Archive`
* click `Upload to App Store...` button
* select a Development team if necessary
* click `Upload` button

---

#### Android Release

Generate a certicate for signing your APK

* `keytool -genkey -v -keystore myapp.keystore -alias myapp -keyalg RSA -keysize 2048 -validity 10000`

Prepare Android app for release [using parameters](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#signing-an-app)

* `project=myapp ionic build android --device --prod --release --keystore=myapp.keystore --storePassword=yourpassword --alias=myapp --password=yourpassword`


Or prepare Android app for release [using build config](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#using-buildjson)

* `ionic build android --device --prod --release --buildConfig=projects/myapp/build.json`

Upload your APK to the Google Play Console

* `platforms/android/build/outputs/apk/MyApp.apk`
* [https://play.google.com/apps/publish](https://play.google.com/apps/publish)

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
