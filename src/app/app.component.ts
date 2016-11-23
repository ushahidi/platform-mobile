import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen, AppVersion } from 'ionic-native';

import { HomePage } from '../pages/home/home';


@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class MyApp {
  rootPage = HomePage;

  constructor(platform: Platform) {
    platform.ready().then(() => {
      console.log("Platform Ready");
      // AppVersion.getAppName().then(appName => {
      //   console.log(`App Name ${appName}`);
      // });
      // AppVersion.getPackageName().then(packageName => {
      //   console.log(`Package Name ${packageName}`);
      // });
      // AppVersion.getVersionCode().then(versionCode => {
      //   console.log(`Version Code ${versionCode}`);
      // });
      // AppVersion.getVersionNumber().then(versionNumber => {
      //   console.log(`Version Number ${versionNumber}`);
      // });
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }
}
