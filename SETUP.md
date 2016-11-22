# Ushahidi
## Mobile Apps

---

## Dependencies

```
npm install -g cordova@latest
npm install -g ionic@latest
npm install cordova-common
npm install xcode
npm install ios-sim
npm install ios-deploy
npm install android-simulator
npm install -g npm-check-updates
npm-check-updates -u
npm install
```

---

## [Ionic](http://ionicframework.com/docs/v2/getting-started/installation/)

```
ionic start ushahidi blank --v2 --ts
```

---

## iOS

```
ionic platform rm ios
ionic platform add ios
```

```
ionic build ios
ionic build ios --release
ionic run ios
ionic run ios --device --livereload --consolelogs --serverlogs
ionic run ios --emulator --livereload --consolelogs --serverlogs --address localhost --port 8000
```

---

## Android

```
android list sdk --all --extended
android update sdk -u -a -t android-24
android update sdk -u -a -t extra-android-m2repository
android update sdk -u -a -t extra-google-google_play_services
android update sdk -u -a -t extra-google-analytics_sdk_v2
android update sdk -u -a -t extra-intel-Hardware_Accelerated_Execution_Manager
android sdk
android avd
```

```
ionic platform rm android
ionic platform add android
```

```
ionic build android
ionic run android --consolelogs --serverlogs
ionic run android --livereload --consolelogs --serverlogs
```

### AMRV7 APK
```
ionic build android --release
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ushahidi.keystore --storepass ushahidi platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk USHAHIDI
zipalign -f -v 4 platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk platforms/android/build/outputs/apk/Ushahidi-ARMV7.apk
```

### X86 APK
```
ionic build android --release
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ushahidi.keystore --storepass ushahidi platforms/android/build/outputs/apk/android-x86-release-unsigned.apk USHAHIDI
zipalign -f -v 4 platforms/android/build/outputs/apk/android-x86-release-unsigned.apk platforms/android/build/outputs/apk/Ushahidi-X86.apk
```

---

## Resources

```
ionic resources
ionic resources --splash
ionic resources --icon
```

---

## Plugins

```
cordova clean
ionic plugin add ionic-plugin-keyboard
ionic plugin add cordova-plugin-app-version
ionic plugin add cordova-plugin-console
ionic plugin add cordova-plugin-device
ionic plugin add cordova-plugin-email
ionic plugin add cordova-plugin-google-analytics
ionic plugin add cordova-plugin-inappbrowser
ionic plugin add cordova-plugin-ios-longpress-fix
ionic plugin add cordova-plugin-ios-no-export-compliance
ionic plugin add cordova-plugin-networkactivityindicator
ionic plugin add cordova-plugin-spinner-dialog
ionic plugin add cordova-plugin-splashscreen
ionic plugin add cordova-plugin-statusbar
ionic plugin add cordova-plugin-whitelist
ionic plugin add cordova-plugin-x-socialsharing
ionic plugin add cordova-sqlite-storage
ionic plugin add cordova-fabric-plugin --variable FABRIC_API_KEY=ce67fdba44588767037fbff566b67932e811c332 --variable FABRIC_API_SECRET=7b24e06a9561fa04b86ae87ef1a0942faaba38b606ac787935af6583d22c3392
ionic plugin add ionic-plugin-deeplinks --variable URL_SCHEME=ushahidi --variable DEEPLINK_SCHEME=https --variable DEEPLINK_HOST=ushahidi.com
```
