import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { HomePage } from '../pages/home/home';

import { DeploymentLoginPage } from '../pages/deployment-login/deployment-login';
import { DeploymentDetailsPage } from '../pages/deployment-details/deployment-details';

@Component({
  templateUrl: 'app.html',
  entryComponents:[
    HomePage,
    DeploymentLoginPage,
    DeploymentDetailsPage ]
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  rootPage = HomePage;
  deployments: any = [];

  constructor(
    public platform: Platform) {
    platform.ready().then(() => {
      console.log(`App Platform Ready ${this.platform.platforms()}`);
      Splashscreen.hide();
      StatusBar.styleDefault();
      StatusBar.overlaysWebView(false);
    });
    this.addTestData();
  }

  addTestData() {
    console.log("App addTestData");
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
