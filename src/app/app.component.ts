import { Component, ViewChild, NgZone } from '@angular/core';
import { Events, Nav, Platform, ModalController, LoadingController, ToastController, AlertController, MenuController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { HomePage } from '../pages/home/home';

import { ApiService } from '../providers/api-service';
import { LoggerService } from '../providers/logger-service';
import { DatabaseService } from '../providers/database-service';

import { DeploymentAddPage } from '../pages/deployment-add/deployment-add';
import { DeploymentLoginPage } from '../pages/deployment-login/deployment-login';
import { DeploymentDetailsPage } from '../pages/deployment-details/deployment-details';

import { Deployment } from '../models/deployment';
import { User } from '../models/user';
import { Form } from '../models/form';
import { Attribute } from '../models/attribute';
import { Post } from '../models/post';
import { Value } from '../models/value';
import { Image } from '../models/image';
import { Filter } from '../models/filter';
import { Collection } from '../models/collection';

@Component({
  templateUrl: 'app.html',
  entryComponents:[
    HomePage,
    DeploymentAddPage,
    DeploymentLoginPage,
    DeploymentDetailsPage ]
})
export class MyApp {

  @ViewChild(Nav)
  nav: Nav;
  zone: NgZone = null;
  rootPage: any = null;
  deployment : Deployment = null;
  deployments: Deployment[] = null;

  constructor(
    zone: NgZone,
    public events:Events,
    public platform: Platform,
    public api:ApiService,
    public logger:LoggerService,
    public database:DatabaseService,
    public modalController:ModalController,
    public toastController:ToastController,
    public loadingController:LoadingController,
    public alertController: AlertController,
    public menuController: MenuController) {
    this.zone = zone;
    platform.ready().then(() => {
      this.logger.info(this, "Platform Ready", this.platform.platforms());
      StatusBar.styleDefault();
      let tables = [
        new Deployment(),
        new User(),
        new Form(),
        new Attribute(),
        new Post(),
        new Value(),
        new Image(),
        new Collection(),
        new Filter()];
      this.database.createTables(tables).then(results => {
        this.logger.info(this, "Database Ready");
        this.database.getDeployments().then(results => {
          this.logger.info(this, "Deployments", results);
          this.deployments = <Deployment[]>results;
          if (this.deployments && this.deployments.length > 0) {
            let deployment = this.deployments[0];
            this.logger.info(this, "Deployment", deployment);
            this.showDeployment(deployment);
          }
          else {
            this.rootPage = HomePage;
          }
          Splashscreen.hide();
        },
        (error) => {
          this.logger.error(this, "Deployments Error", error);
          this.rootPage = HomePage;
          Splashscreen.hide();
        });
      },
      (error) => {
        this.logger.error(this, "Database Error", error);
        this.rootPage = HomePage;
        Splashscreen.hide();
      });
    });
  }

  loadDeployments(event:any=null) {
    this.logger.info(this, "loadDeployments");
    this.database.getDeployments().then(results => {
      this.logger.info(this, "loadDeployments", results);
      this.zone.run(() => {
        this.deployments = <Deployment[]>results;
        if (this.deployments.length > 0 && this.deployment == null) {
          this.deployment = this.deployments[0];
        }
        if (event != null) {
          event.complete();
        }
      });
    });
  }

  addDeployment(event:any) {
    this.logger.info(this, "addDeployment");
    let modal = this.modalController.create(
      DeploymentAddPage,
      { });
    modal.present();
    modal.onDidDismiss(data => {
      StatusBar.styleDefault();
      StatusBar.backgroundColorByHexString('#f9f9f8');
      if (data) {
        this.logger.info(this, data);
        this.showDeployment(data['deployment']);
      }
    });
  }

  showDeployment(deployment:Deployment, refresh:boolean=false) {
    this.logger.info(this, "showDeployment", deployment);
    this.deployment = deployment;
    // if (refresh && deployment.refresh_token) {
    //   this.logger.info(this, "showDeployment", "Refresh Token", deployment.refresh_token);
    //   this.api.authRefresh(deployment, deployment.refresh_token).then(tokens => {
    //     this.logger.info(this, "showDeployment", "Tokens", tokens);
    //     if (tokens && tokens['access_token']) {
    //       this.deployment.copyInto(tokens);
    //       this.database.saveDeployment(this.deployment).then(saved => {
    //         this.nav.setRoot(
    //           DeploymentDetailsPage,
    //           { deployment: deployment });
    //       });
    //     }
    //     else {
    //       this.nav.setRoot(
    //         DeploymentLoginPage,
    //         { deployment: deployment });
    //     }
    //   });
    // }
    // else
    if (deployment.username && deployment.password) {
      this.logger.info(this, "showDeployment", "Username", deployment.username);
      this.api.authLogin(deployment, deployment.username, deployment.password).then(tokens => {
        this.logger.info(this, "showDeployment", "Tokens", tokens);
        if (tokens && tokens['access_token']) {
          this.deployment.copyInto(tokens);
          this.database.saveDeployment(this.deployment).then(saved => {
            this.nav.setRoot(
              DeploymentDetailsPage,
              { deployment: deployment });
          });
        }
        else {
          this.nav.setRoot(
            DeploymentLoginPage,
            { deployment: deployment });
        }
      });
    }
    else {
      this.logger.info(this, "showDeployment", "Refresh Token NONE");
      this.nav.setRoot(
        DeploymentLoginPage,
        { deployment: deployment });
    }
  }

  removeDeployment(event:any, deployment:Deployment) {
    this.logger.info(this, "removeDeployment", deployment.name);
    let loading = this.showLoading("Removing...");
    let promises = [
      this.database.removeUsers(deployment),
      this.database.removeAttributes(deployment),
      this.database.removeForms(deployment),
      this.database.removeValues(deployment),
      this.database.removeImages(deployment),
      this.database.removePosts(deployment),
      this.database.removeFilters(deployment),
      this.database.removeDeployment(deployment)];
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
        this.logger.error(this, "removeDeployment", error);
        loading.dismiss();
        this.showAlert('Problem Removing Deployment', error);
      });
  }

  showLoading(message:string) {
    let loading = this.loadingController.create({
      content: message
    });
    loading.present();
    return loading;
  }

  showAlert(title:string, subTitle:string) {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: ['OK']
    });
    alert.present();
    return alert;
  }

  showToast(message:string, duration:number=1500) {
    let toast = this.toastController.create({
      message: message,
      duration: duration
    });
    toast.present();
    return toast;
  }
}
