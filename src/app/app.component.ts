import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { HomePage } from '../pages/home/home';

import { DatabaseService } from '../providers/database-service';

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

  rootPage: any = null;
  deployments: any = [];

  constructor(
    public platform: Platform,
    public database:DatabaseService) {
    platform.ready().then(() => {
      console.log(`App Platform Ready ${this.platform.platforms()}`);
      StatusBar.styleDefault();
      database.createTables().then(results => {
        console.log("App Database Ready");
        database.getDeployments().then(results => {
          console.log(`App Deployments ${JSON.stringify(results)}`);
          this.deployments = <any[]>results;
          if (this.deployments && this.deployments.length > 0) {
            let deployment = this.deployments[0];
            console.log(`App Deployment ${JSON.stringify(deployment)}`);
            this.nav.setRoot(
              DeploymentLoginPage,
              { deployment: deployment });  
          }
          else {
            this.rootPage = HomePage;
          }
          Splashscreen.hide();
        });
      });
    });
  }

  showDeployment(event, deployment) {
    console.log("App showDeployment");
    this.nav.setRoot(
      DeploymentLoginPage,
      { deployment: deployment });
  }
}
