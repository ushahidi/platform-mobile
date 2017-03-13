import { Component, ViewChild, NgZone } from '@angular/core';
import { Alert, Toast, Loading, Events, Nav, Platform, ModalController, LoadingController, ToastController, AlertController, MenuController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import ImgCache from 'imgcache.js';

import { Model } from '../models/model';
import { Deployment } from '../models/deployment';
import { User } from '../models/user';
import { Form } from '../models/form';
import { Attribute } from '../models/attribute';
import { Post } from '../models/post';
import { Value } from '../models/value';
import { Image } from '../models/image';
import { Filter } from '../models/filter';
import { Collection } from '../models/collection';

import { ApiService } from '../providers/api-service';
import { LoggerService } from '../providers/logger-service';
import { DatabaseService } from '../providers/database-service';

import { HomePage } from '../pages/home/home';
import { DeploymentSearchPage } from '../pages/deployment-search/deployment-search';
import { DeploymentDetailsPage } from '../pages/deployment-details/deployment-details';

declare var window: any;
declare var cordova:any;

@Component({
  templateUrl: 'app.html',
  entryComponents:[ HomePage, DeploymentSearchPage, DeploymentDetailsPage ]
})
export class MyApp {

  zone: NgZone = null;
  rootPage: any = null;
  deployment : Deployment = null;
  deployments: Deployment[] = null;

  @ViewChild(Nav)
  nav: Nav;

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
    let models = [
      new Deployment(),
      new User(),
      new Form(),
      new Attribute(),
      new Post(),
      new Value(),
      new Image(),
      new Collection(),
      new Filter()];
    this.platform.ready().then(() => {
      this.logger.info(this, "Platform Ready", this.platform.platforms());
      StatusBar.styleDefault();
      this.loadImageCache();
      this.loadDatabase(models).then(
        (loaded) => {
          this.loadDeployments().then(
            (deployments) => {
              this.showRootPage(deployments);
            },
            (error) => {
              this.showRootPage();
            });
        },
        (error) => {
          Splashscreen.hide();
          this.showAlert("Database Schema Changed", "The database schema has changed, your local database will need to be reset.", [{
            text: 'Reset Database',
            handler: (clicked) => {
              let loading = this.showLoading("Resetting...");
              this.resetDatabase().then(
                (reset) => {
                  this.loadDatabase(models).then(
                    (created) => {
                      loading.dismiss();
                      this.showRootPage();
                    },
                    (error) => {
                      loading.dismiss();
                      this.showAlert("Problem Creating Database", "There was a problem creating the database.");
                    }
                  );
                },
                (error) => {
                  loading.dismiss();
                  this.showAlert("Problem Resetting Database", "There was a problem resetting the database.");
              });
            }
          }]);
      });
    });
  }

  loadImageCache() {
    this.logger.info(this, "loadImageCache");
    if (this.platform.is('ios')) {
      ImgCache.options.cordovaFilesystemRoot = cordova.file.documentsDirectory;
    }
    else {
      ImgCache.options.cordovaFilesystemRoot = cordova.file.dataDirectory;
    }
    ImgCache.init(
      ()=>{
        this.logger.info(this, "loadImageCache", "ImgCache Loaded");
      },
      ()=>{
        this.logger.error(this, "loadImageCache", "ImgCache Failed");
      }
    );
  }

  resetDatabase():Promise<any> {
    this.logger.info(this, "resetDatabase");
    return this.database.deleteDatabase();
  }

  loadDatabase(models:Model[]):Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadDatabase");
      this.database.createTables(models).then(
        (created:any) => {
          this.logger.info(this, "loadDatabase", "Created");
          let tests = [];
          for (let model of models) {
            tests.push(this.database.testModel(model));
          }
          Promise.all(tests).then(
            (passed) => {
              this.logger.info(this, "loadDatabase", "Tested");
              resolve();
            },
            (error) => {
              this.logger.error(this, "loadDatabase", "Failed", error);
              reject(error);
            });
        },
        (error:any) => {
          this.logger.error(this, "loadDatabase", "Failed", error);
          reject(error);
        });
    });
  }

  loadDeployments(event:any=null):Promise<Deployment[]> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadDeployments");
      this.database.getDeployments().then(
        (deployments:Deployment[]) => {
          this.logger.info(this, "loadDeployments", deployments);
          this.zone.run(() => {
            this.deployments = deployments;
            if (this.deployments.length > 0 && this.deployment == null) {
              this.deployment = this.deployments[0];
            }
            if (event != null) {
              event.complete();
            }
            resolve(deployments);
          });
        },
        (error:any) => {
          this.logger.error(this, "loadDeployments", error);
          reject(error);
        });
    });
  }

  showRootPage(deployments:Deployment[]=null) {
    this.logger.info(this, "showRootPage");
    if (deployments && deployments.length > 0) {
      this.loginDeployment(this.deployment).then((ready) => {
        Splashscreen.hide();
      });
    }
    else {
      this.rootPage = HomePage;
      Splashscreen.hide();
    }
  }

  addDeployment(event:any) {
    this.logger.info(this, "addDeployment");
    let modal = this.modalController.create(
      DeploymentSearchPage,
      { });
    modal.present();
    modal.onDidDismiss((data:any) => {
      StatusBar.styleDefault();
      StatusBar.backgroundColorByHexString('#f9f9f8');
      if (data && data.deployment) {
        this.logger.info(this, "addDeployment", data);
        let deployment:Deployment = data.deployment;
        this.loginDeployment(deployment);
      }
    });
  }

  changeDeployment(deployment:Deployment) {
    let loading = this.showLoading("Loading...");
    this.loginDeployment(deployment).then((loaded) => {
      loading.dismiss();
    })
  }

  loginDeployment(deployment:Deployment) {
    this.logger.info(this, "loginDeployment", deployment);
    this.deployment = deployment;
    if (deployment.hasUsername() && deployment.hasPassword()) {
      this.logger.info(this, "loginDeployment", "Username", deployment.username);
      return this.api.authLogin(deployment, deployment.username, deployment.password).then(
        (tokens:any) => {
          this.logger.info(this, "loginDeployment", "Username", deployment.username, "Tokens", tokens);
          if (tokens) {
            this.showDeployment(deployment, tokens);
          }
          else {
            return this.api.clientLogin(deployment).then(
              (tokens:any) => {
                this.logger.info(this, "loginDeployment", "Client", tokens);
                this.showDeployment(deployment, tokens);
              },
              (error:any) => {
                this.logger.error(this, "loginDeployment", "Client", error);
              });
          }
        },
        (error:any) => {
          this.logger.error(this, "loginDeployment", "Username", error);
          return this.api.clientLogin(deployment).then(
            (tokens:any) => {
              this.logger.info(this, "loginDeployment", "Client", tokens);
              this.showDeployment(deployment, tokens);
            },
            (error:any) => {
              this.logger.error(this, "loginDeployment", "Client", error);
            });
        });
    }
    else {
      this.logger.info(this, "loginDeployment", "Client");
      return this.api.clientLogin(deployment).then(
        (tokens:any) => {
          this.logger.info(this, "loginDeployment", "Client", tokens);
          this.showDeployment(deployment, tokens);
        },
        (error:any) => {
          this.logger.error(this, "loginDeployment", "Client", error);
        });
    }
  }

  showDeployment(deployment:Deployment, tokens:any) {
    this.logger.info(this, "showDeployment", tokens, deployment);
    deployment.copyInto(tokens);
    this.database.saveDeployment(deployment).then(
      (saved) => {
        this.menuController.close();
        this.nav.setRoot(
          DeploymentDetailsPage,
          { deployment: deployment });
      });
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
              this.loginDeployment(this.deployment);
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

  showLoading(message:string):Loading {
    let loading = this.loadingController.create({
      content: message
    });
    loading.present();
    return loading;
  }

  showAlert(title:string, subTitle:string, buttons:any=['OK']):Alert {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: buttons
    });
    alert.present();
    return alert;
  }

  showToast(message:string, duration:number=1500):Toast {
    let toast = this.toastController.create({
      message: message,
      duration: duration
    });
    toast.present();
    return toast;
  }
}
