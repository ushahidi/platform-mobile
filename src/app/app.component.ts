import { Component, ViewChild, NgZone } from '@angular/core';
import { Nav, Platform, ModalController, LoadingController, ToastController, AlertController, MenuController } from 'ionic-angular';
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
    public modalController:ModalController,
    public toastController:ToastController,
    public loadingController:LoadingController,
    public alertController: AlertController,
    public menuController: MenuController) {
    this.zone = zone;
    platform.ready().then(() => {
      console.log(`App Platform Ready ${this.platform.platforms()}`);
      StatusBar.styleDefault();
      this.database.createTables().then(results => {
        console.log("App Database Ready");
        if (results) {
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
          },
          (error) => {
            console.error(`App Deployments Error ${error}`);
            this.rootPage = HomePage;
            Splashscreen.hide();
          });
        }
        else {
          this.rootPage = HomePage;
          Splashscreen.hide();
        }
      },
      (error) => {
        console.error(`App Database Error ${error}`);
        this.rootPage = HomePage;
        Splashscreen.hide();
      });
    });
  }

  loadDeployments(event=null) {
    console.log("App loadDeployments");
    this.database.getDeployments().then(results => {
      console.log(`App Deployments ${JSON.stringify(results)}`);
      this.zone.run(() => {
        this.deployments = <any[]>results;
        if (this.deployment == null) {
          this.deployment = this.deployments[0];
        }
        if (event) {
          event.complete();
        }
      });
    });
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

  removeDeployment(event, deployment) {
    console.log(`App removeDeployment ${deployment.name}`);
    let loading = this.loadingController.create({
      content: "Removing..."
    });
    loading.present();
    let promises = [
      this.database.removeAttributes(deployment.id),
      this.database.removeForms(deployment.id),
      this.database.removePosts(deployment.id),
      this.database.removeDeployment(deployment.id)];
    Promise.all(promises).then(
      (results) => {
        this.database.getDeployments().then(results => {
          loading.dismiss();
          this.zone.run(() => {
            this.deployments = <any[]>results;
            if (this.deployments.length == 0) {
              this.nav.setRoot(HomePage);
              this.menuController.close();
            }
            else if (this.deployment.id == deployment.id){
              this.deployment = this.deployments[0];
              this.showDeployment(this.deployment);
            }
          });
        });
      },
      (error) => {
        loading.dismiss();
        let alert = this.alertController.create({
          title: 'Problem Removing Deployment',
          subTitle: error,
          buttons: ['OK']
        });
        alert.present();
      });
  }
}
