import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen, AppVersion } from 'ionic-native';

import { HomePage } from '../pages/home/home';

import { DeploymentLoginPage } from '../pages/deployment-login/deployment-login';
import { DeploymentDetailsPage } from '../pages/deployment-details/deployment-details';

@Component({
  templateUrl: 'app.html',
  entryComponents:[ HomePage, DeploymentLoginPage, DeploymentDetailsPage ]
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
    this.deployments.push({
      "domain":"api.ushahidi.io",
      "subdomain":"dale",
      "deployment_name":"Dale's Deployment"});
  }

  showDeployment(event, deployment) {
    console.log("App showDeployment");
    this.nav.setRoot(
      DeploymentLoginPage,
      { deployment: deployment });
  }
}
