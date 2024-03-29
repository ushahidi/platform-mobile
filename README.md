# Ushahidi
## Mobile Apps

---

## Whitelabel

#### Interested in a whitelabel version of our app? Contact our [sales team](mailto:sales@ushahidi.com) for help or visit our [enterprise page](https://www.ushahidi.com/enterprise) for more information.

---

## GitHub
#### Clone the [Ushahidi](https://github.com/ushahidi/platform-mobile-app) repo

```
git clone git@github.com:ushahidi/platform-mobile-app.git
cd platform-mobile-app
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

NOTE: version 7.x not supported, stick to 6.x

```
npm install -g npm@6
```

Check the version of NPM

```
npm --version
```

Remove, Clean, Install
```
rm -rf node_modules/
npm install
```

---

## Cordova
#### Install the latest [Cordova](https://www.npmjs.com/package/cordova)

Install the latest Cordova

```
npm install -g cordova@7.1.0
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

Install Ionic 4

```
npm install -g ionic@4
```


Install some Ionic and Cordova utilities

```
npm install -g xcode@^3.0
npm install -g ios-sim@^9
npm install -g ios-deploy@^11
npm install -g cordova-res@^0.15
npm install -g android-simulator@^0.1
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
ionic cordova run ios --livereload --consolelogs --serverlogs --target "iPhone-SE"
ionic cordova run ios --livereload --consolelogs --serverlogs --target "iPad-Air-2"
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
