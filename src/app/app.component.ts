import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { HomePage } from '../pages/home/home';

import { ApiService } from '../providers/api-service';
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
    public api:ApiService,
    public database:DatabaseService) {
    platform.ready().then(() => {
      console.log(`App Platform Ready ${this.platform.platforms()}`);
      StatusBar.styleDefault();
      this.database.createTables().then(results => {
        console.log("App Database Ready");
        this.database.getDeployments().then(results => {
          console.log(`App Deployments ${JSON.stringify(results)}`);
          this.deployments = <any[]>results;
          if (this.deployments && this.deployments.length > 0) {
            let deployment = this.deployments[0];
            console.log(`App Deployment ${JSON.stringify(deployment)}`);
            this.showDeployment(deployment);
          }
          else {
            this.rootPage = HomePage;
          }
          Splashscreen.hide();
        });
      });
    });
  }

  showDeployment(deployment) {
    console.log(`App showDeployment ${deployment.name}`);
    if (deployment.refresh_token) {
      console.log(`App showDeployment Refresh Token ${deployment.refresh_token}`);
      this.api.authRefresh(deployment.url, deployment.refresh_token).then(tokens => {
        console.log(`App showDeployment Tokens ${JSON.stringify(tokens)}`);
        if (tokens && tokens['access_token']) {
          this.nav.setRoot(
            DeploymentDetailsPage,
            { token: tokens['access_token'],
              deployment: deployment });
        }
        else {
          this.nav.setRoot(
            DeploymentLoginPage,
            { deployment: deployment });
        }
      });
    }
    else {
      console.log(`App showDeployment Refresh Token NONE`);
      this.nav.setRoot(
        DeploymentLoginPage,
        { deployment: deployment });
    }
  }
}
