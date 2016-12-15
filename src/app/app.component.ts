import { Component, ViewChild, NgZone } from '@angular/core';
import { Nav, Platform, ModalController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { HomePage } from '../pages/home/home';

import { ApiService } from '../providers/api-service';
import { DatabaseService } from '../providers/database-service';

import { DeploymentAddPage } from '../pages/deployment-add/deployment-add';
import { DeploymentLoginPage } from '../pages/deployment-login/deployment-login';
import { DeploymentDetailsPage } from '../pages/deployment-details/deployment-details';

@Component({
  templateUrl: 'app.html',
  entryComponents:[
    HomePage,
    DeploymentAddPage,
    DeploymentLoginPage,
    DeploymentDetailsPage ]
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  zone: any;
  rootPage: any = null;
  deployment : any = null;
  deployments: any = null;

  constructor(
    zone: NgZone,
    public platform: Platform,
    public api:ApiService,
    public database:DatabaseService,
    public modalController: ModalController) {
    this.zone = zone;
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

  menuOpen(event) {
    console.log("App menuOpen");
    this.database.getDeployments().then(results => {
      console.log(`App Deployments ${JSON.stringify(results)}`);
      this.zone.run(() => {
        this.deployments = <any[]>results;
        if (this.deployment == null) {
          this.deployment = this.deployments[0];
        }
      });
    });
  }

  menuClose(event) {
    console.log("App menuClose");
  }

  addDeployment(event) {
    console.log("App addDeployment");
    let modal = this.modalController.create(
      DeploymentAddPage,
      { });
    modal.present();
    modal.onDidDismiss(data => {
      StatusBar.styleDefault();
      StatusBar.backgroundColorByHexString('#f9f9f8');
      if (data) {
        console.log(data);
        this.showDeployment(data['deployment']);
      }
    });
  }

  showDeployment(deployment) {
    console.log(`App showDeployment ${deployment.name}`);
    this.deployment = deployment;
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
