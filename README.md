# Ushahidi
## Mobile

---

## GitHub
### Clone the [Ushahidi](https://github.com/ushahidi/platform-mobile) repo

```
git clone git@github.com:ushahidi/platform-mobile.git Ushahidi_Mobile
cd Ushahidi_Mobile
```

---
## Homebrew
### Ensure that [Homebrew](http://brew.sh) is installed

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Add Homebrew location `export PATH="/usr/local/bin:$PATH"` to your `$PATH`.

```
brew update
brew doctor
```

---

## NPM
### Ensure that [NPM](https://www.npmjs.com) is installed

```
brew install node
```

---

## Ionic
### Install the latest [Cordova](https://cordova.apache.org), [Ionic2](http://ionicframework.com/docs/v2/) and necessary dependencies

```
npm install -g cordova@latest
npm install -g ionic@latest
npm install cordova-common
npm install ios-sim
npm install ios-deploy
npm install android-simulator
npm install
```

---


## XCode
### Ensure that [XCode](https://developer.apple.com/xcode/) is installed

```
https://developer.apple.com/xcode/
```

---

## Android
### Ensure that [Android](https://developer.android.com/index.html) is installed

```
https://developer.android.com/index.html
```

```
android list sdk --all --extended
android update sdk -u -a -t android-24
android update sdk -u -a -t extra-android-m2repository
android update sdk -u -a -t extra-google-google_play_services
android update sdk -u -a -t extra-google-analytics_sdk_v2
android update sdk -u -a -t extra-intel-Hardware_Accelerated_Execution_Manager
```

```
android sdk
android avd
```

---

## iOS
### Commands to build and run the iOS app

```
ionic build ios
ionic build ios --release
```

```
ionic run ios
ionic run ios --device --livereload --consolelogs --serverlogs
ionic run ios --emulator --livereload --consolelogs --serverlogs --address localhost --port 8000
```

---

## iOS
### Commands to build and run the Android app

```
ionic build android
ionic build android --release
```

```
ionic run android --consolelogs --serverlogs
ionic run android --livereload --consolelogs --serverlogs
```
