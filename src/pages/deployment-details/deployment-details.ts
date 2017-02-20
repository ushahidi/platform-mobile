import { Component, NgZone } from '@angular/core';
import { Platform, NavParams,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { BasePage } from '../../pages/base-page/base-page';
import { DeploymentLoginPage } from '../../pages/deployment-login/deployment-login';
import { DeploymentSettingsPage } from '../../pages/deployment-settings/deployment-settings';

import { ResponseListPage } from '../response-list/response-list';
import { ResponseAddPage } from '../response-add/response-add';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { Deployment } from '../../models/deployment';
import { User } from '../../models/user';
import { Form } from '../../models/form';
import { Attribute } from '../../models/attribute';
import { Collection } from '../../models/collection';

import { PLACEHOLDER_BLANK } from '../../helpers/constants';

@Component({
  selector: 'page-deployment-details',
  templateUrl: 'deployment-details.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ ResponseListPage, ResponseAddPage, DeploymentSettingsPage ]
})
export class DeploymentDetailsPage extends BasePage {

  deployment: Deployment = null;
  user: User = null;
  placeholder: string = PLACEHOLDER_BLANK;

  constructor(
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

    ionViewDidLoad() {
      super.ionViewDidLoad();
    }

    ionViewWillEnter() {
      super.ionViewWillEnter();
      this.platform.ready().then(() => {
        StatusBar.styleLightContent();
        StatusBar.backgroundColorByHexString('#3f4751');
      });
      this.deployment = this.getParameter<Deployment>("deployment");
      this.loadUpdates(null, true);
    }

    loadUpdates(event:any=null, cache:boolean=false) {
      this.logger.info(this, "loadUpdates");
      let updates = [
        this.loadDeployment(cache),
        this.loadUser(cache),
        this.loadForms(cache),
        this.loadCollections(cache)];
      Promise.all(updates).then(done => {
        if (event) {
          event.complete();
        }
      });
    }

    loadDeployment(cache:boolean=true):Promise<any> {
      this.logger.info(this, "loadDeployment", cache);
      if (cache && this.deployment.image && this.deployment.description) {
        this.logger.info(this, "loadDeployment", "Cached");
        return Promise.resolve();
      }
      else {
        return new Promise((resolve, reject) => {
          this.api.getDeployment(this.deployment, cache, this.offline).then(
            (deployment:Deployment) => {
              this.deployment.copyInto(deployment);
              this.database.saveModel(this.deployment).then(
                (saved:any) => {
                  this.logger.info(this, "loadDeployment", "API", saved);
                  resolve();
                },
                (error:any) => {
                  this.logger.error(this, "loadDeployment", "API", error);
                  reject(error);
              });
            },
            (error:any) => {
              this.logger.error(this, "loadDeployment", "API", error);
              reject(error);
          });
        });
      }
    }

    loadUser(cache:boolean=true):Promise<any> {
      this.logger.info(this, "loadUser", cache);
      if (cache && this.user) {
        this.logger.info(this, "loadUser", "Cached", this.user);
        return Promise.resolve();
      }
      else {
        return new Promise((resolve, reject) => {
          this.api.getUser(this.deployment).then(
            (user:User) => {
              this.logger.info(this, "loadUser", "API", user);
              this.user = user;
              this.database.saveUser(this.deployment, this.user).then(
                (saved:any) => {
                  this.logger.info(this, "loadUser", "Saved", saved);
                  resolve();
                },
                (error) => {
                  this.logger.error(this, "loadUser", "Failed", error);
                  reject(error);
                });
            },
            (error:any) => {
              this.logger.error(this, "loadUser", "Failed", error);
              reject(error);
            });
        });
      }
    }

    loadForms(cache:boolean=true):Promise<any> {
      this.logger.info(this, "loadForms", cache);
      if (cache && this.deployment.forms != null && this.deployment.forms.length > 0) {
        this.logger.info(this, "loadForms", "Cached");
        return Promise.resolve();
      }
      else {
        return new Promise((resolve, reject) => {
          this.api.getFormsWithAttributes(this.deployment, cache, this.offline).then(
            (forms:Form[]) => {
              this.logger.info(this, "loadForms", "API", forms);
              this.deployment.forms = forms;
              resolve();
            },
            (error) => {
              this.logger.error(this, "loadForms", "API", error);
              reject(error);
            });
        });
      }
    }

    loadCollections(cache:boolean=true):Promise<any> {
      this.logger.info(this, "loadCollections", cache);
      if (cache && this.deployment.collections != null && this.deployment.collections.length > 0) {
        this.logger.info(this, "loadCollections", "Cached");
        return Promise.resolve();
      }
      else {
        return new Promise((resolve, reject) => {
          this.api.getCollections(this.deployment, cache, this.offline).then(
            (collections:Collection[]) => {
              this.logger.info(this, "loadCollections", "API", collections);
              this.deployment.collections = collections;
              resolve();
            },
            (error:any) => {
              this.logger.error(this, "loadCollections", "API", error);
              reject(error);
            });
        });
      }
    }

    showResponses(event:any) {
      this.logger.info(this, "showResponses");
      this.showPage(ResponseListPage,
        { deployment: this.deployment });
    }

    showCollections(event:any) {
      this.logger.info(this, "showCollections");
      this.showToast('Collections Not Implemented');
    }

    showSettings(event:any) {
      this.logger.info(this, "showSettings");
      this.showPage(DeploymentSettingsPage,
        { deployment: this.deployment });
    }

    addResponse(event:any) {
      this.logger.info(this, "addResponse");
      let buttons = [];
      if (this.deployment.forms) {
        for (let form of this.deployment.forms){
          buttons.push({
            text: form.name,
            handler: () => {
              this.logger.info(this, "addResponse", "Form", form.name);
              this.showResponseAdd(form);
          }});
        }
      }
      buttons.push({
        text: 'Cancel',
        role: 'cancel' });
      this.showActionSheet('Submit a survey response', buttons);
    }

    showResponseAdd(form:Form) {
      this.logger.info(this, "showResponseAdd", form.name);
      let modal = this.showModal(ResponseAddPage,
        { deployment: this.deployment,
          form: form })
      modal.onDidDismiss(data => {
        this.logger.info(this, "showResponseAdd", "Modal", data);
      });
    }

    shareDeployment(event:any) {
      let subject = this.deployment.name;
      let message = this.deployment.description
      let file = this.deployment.image;
      let url = this.deployment.url;
      this.logger.info(this, "shareDeployment", "Subject", subject, "Message", message, "File", file, "URL", url);
      this.showShare(subject, message, file, url).then(
        (shared) => {
          if (shared) {
            this.showToast("Deployment Shared");
          }
        },
        (error) => {
          this.showToast(error);
      });
    }

    onLogout(event:any) {
      this.logger.info(this, "onLogout");
      let loading = this.showLoading("Logging out...");
      this.deployment.username = "";
      this.deployment.password = "";
      this.deployment.access_token = "";
      this.deployment.refresh_token = "";
      this.database.saveDeployment(this.deployment).then(
        (results) => {
          loading.dismiss();
          this.showToast('Logout Successful');
          this.showRootPage(DeploymentLoginPage,
           { deployment: this.deployment },
           { });
        },
        (error) => {
          loading.dismiss();
          this.showAlert('Problem Logging Out', error);
        });
    }

}
