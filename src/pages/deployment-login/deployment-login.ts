import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, TextInput, Button, NavParams, Events,
  NavController, ViewController, ModalController, LoadingController, ToastController, AlertController, ActionSheetController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { Deployment } from '../../models/deployment';
import { Collection } from '../../models/collection';
import { Form } from '../../models/form';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';

import { DEPLOYMENT_UPDATED } from '../../constants/events';

@Component({
  selector: 'deployment-login-page',
  templateUrl: 'deployment-login.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
})
export class DeploymentLoginPage extends BasePage {

  deployment: Deployment = null;

  @ViewChild('login')
  login: Button;

  @ViewChild('username')
  username: TextInput;

  @ViewChild('password')
  password: TextInput;

  constructor(
    public events:Events,
    public api:ApiService,
    public logger:LoggerService,
    public database:DatabaseService,
    public navParams: NavParams,
    public zone: NgZone,
    public platform:Platform,
    public navController:NavController,
    public viewController:ViewController,
    public modalController:ModalController,
    public toastController:ToastController,
    public alertController:AlertController,
    public loadingController:LoadingController,
    public actionController:ActionSheetController) {
      super(zone, platform, logger, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
    }

    ionViewWillEnter() {
      super.ionViewWillEnter();
      this.platform.ready().then(() => {
        StatusBar.styleLightContent();
        StatusBar.backgroundColorByHexString('#3f4751');
      });
      this.deployment = this.getParameter<Deployment>("deployment");
      if (this.deployment.username) {
        this.username.value = this.deployment.username;
      }
      if (this.deployment.password) {
        this.password.value = this.deployment.password;
      }
    }

    userLogin(event:any) {
      this.logger.info(this, "userLogin");
      let username = this.username.value.toString();
      let password = this.password.value.toString();
      if (username.length > 0 && password.length > 0) {
        let loading = this.showLoading("Logging in...");
        this.api.authLogin(this.deployment, username, password).then(
          (tokens:any) => {
            this.logger.info(this, "userLogin", "Tokens", tokens);
            if (tokens != null) {
              this.deployment.copyInto(tokens);
              return Promise.resolve()
                .then(() => { return this.loadDeployment(); })
                .then(() => { return this.loadForms(); })
                .then(() => { return this.loadCollections(); })
                .then(() => { return this.removePosts(); })
                .then(() => {
                  loading.dismiss();
                  this.events.publish(DEPLOYMENT_UPDATED, this.deployment.id);
                  this.showToast('Login Successful');
                  this.showDeployment(this.deployment);
                })
                .catch((error:any) => {
                  loading.dismiss();
                  this.showAlert('Problem Updating Deployment', error);
                });
            }
            else {
              loading.dismiss();
              this.showAlert('Invalid Credentials', 'Please verify your email and password, then try again.');
            }
          },
          (error:any) => {
            loading.dismiss();
            this.showAlert('Invalid Credentials', 'Please verify your email and password, then try again.');
          });
      }
    }

    showDeployment(deployment:Deployment) {
      this.closePage({
        deployment: deployment });
    }

    onCancel(event:any=null) {
      this.logger.info(this, "onCancel");
      this.viewController.dismiss();
    }

    loadDeployment():Promise<any> {
      this.logger.info(this, "loadDeployment");
      return new Promise((resolve, reject) => {
        this.api.getDeployment(this.deployment, false, this.offline).then(
          (deployment:Deployment) => {
            this.logger.info(this, "loadDeployment", "Loaded", deployment);
            this.deployment.copyInto(deployment);
            this.database.saveModel(this.deployment).then(
              (saved:any) => {
                this.logger.info(this, "loadDeployment", "Saved", saved);
                resolve();
              },
              (error:any) => {
                this.logger.error(this, "loadDeployment", "Failed", error);
                reject(error);
            });
          },
          (error:any) => {
            this.logger.error(this, "loadDeployment", "Failed", error);
            reject(error);
        });
      });
  }

  loadForms():Promise<any> {
    this.logger.info(this, "loadForms");
    return new Promise((resolve, reject) => {
      this.api.getFormsWithAttributes(this.deployment, false, this.offline).then(
        (forms:Form[]) => {
          this.logger.info(this, "loadForms", "Loaded", forms.length);
          this.deployment.forms = forms;
          resolve();
        },
        (error) => {
          this.logger.error(this, "loadForms", "Failed", error);
          reject(error);
        });
    });
  }

  loadCollections():Promise<any> {
    this.logger.info(this, "loadCollections");
    return new Promise((resolve, reject) => {
      this.api.getCollections(this.deployment, false, this.offline).then(
        (collections:Collection[]) => {
          this.logger.info(this, "loadCollections", "Loaded", collections.length);
          this.deployment.collections = collections;
          resolve();
        },
        (error:any) => {
          this.logger.error(this, "loadCollections", "Failed", error);
          reject(error);
        });
    });
  }

  removePosts():Promise<any> {
    return new Promise((resolve, reject) => {
      this.database.removePosts(this.deployment).then(
        (removed:any) => {
          this.logger.info(this, "removePosts", "Removed", removed);
          resolve();
        },
        (error:any) => {
          this.logger.error(this, "removePosts", "Failed", error);
          reject(error);
        });
      });
  }

}
