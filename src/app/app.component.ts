import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen, AppVersion } from 'ionic-native';

import { HomePage } from '../pages/home/home';
import { DeploymentDetailsPage } from '../pages/deployment-details/deployment-details';

@Component({
  templateUrl: 'app.html',
  entryComponents:[ HomePage, DeploymentDetailsPage ]
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  rootPage = HomePage;
  deployments: any = [];

  constructor(
    public platform: Platform) {
    platform.ready().then(() => {
      console.log("App Platform Ready");
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

  showDeployment(event, deployment) {
    console.log("App showDeployment");
    this.nav.setRoot(
      DeploymentDetailsPage,
      { deployment: deployment });
  }
}
