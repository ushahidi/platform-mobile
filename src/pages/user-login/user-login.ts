import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, TextInput, Events, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Login } from '../../models/login';
import { Deployment } from '../../models/deployment';
import { Collection } from '../../models/collection';
import { Form } from '../../models/form';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';

import { DEPLOYMENT_UPDATED } from '../../constants/events';

@Component({
  selector: 'user-login-page',
  templateUrl: 'user-login.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
})
export class UserLoginPage extends BasePage {

  login: Login = null;
  deployment: Deployment = null;

  @ViewChild('username')
  username: TextInput;

  @ViewChild('password')
  password: TextInput;

  constructor(
    protected zone:NgZone,
    protected platform:Platform,
    protected navParams:NavParams,
    protected navController:NavController,
    protected viewController:ViewController,
    protected modalController:ModalController,
    protected toastController:ToastController,
    protected alertController:AlertController,
    protected loadingController:LoadingController,
    protected actionController:ActionSheetController,
    protected logger:LoggerService,
    protected api:ApiService,
    protected database:DatabaseService,
    protected events:Events) {
    super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, logger);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.loadStatusBar(true, true);
    this.deployment = this.getParameter<Deployment>("deployment");
    this.login = this.getParameter<Login>("login");
    if (this.login && this.login.username) {
      this.username.value = this.login.username;
    }
  }

  userLogin(event:any) {
    this.logger.info(this, "userLogin");
    let username = this.username.value.toString();
    let password = this.password.value.toString();
    if (username.length > 0 && password.length > 0) {
      this.language.getTranslations([
        'USER_LOGGING_IN_',
        'USER_LOGIN_SUCCESS',
        'USER_LOGIN_FAILURE',
        'USER_INVALID_CREDENTIALS',
        'USER_INVALID_CREDENTIALS_DESCRIPTION']).then((translations:string[]) => {
        let loading = this.showLoading(translations[0]);
        this.api.userLogin(this.deployment, username, password).then(
          (login:Login) => {
            this.logger.info(this, "userLogin", "Login", login);
            if (login != null) {
              return Promise.resolve()
                .then(() => { return this.loadDeployment(); })
                .then(() => { return this.loadForms(); })
                .then(() => { return this.loadCollections(); })
                .then(() => { return this.removePosts(); })
                .then(() => {
                  loading.dismiss();
                  this.events.publish(DEPLOYMENT_UPDATED, this.deployment.id);
                  this.showToast(translations[1]);
                  this.showDeployment(this.deployment);
                })
                .catch((error:any) => {
                  loading.dismiss();
                  this.showAlert(translations[2], error);
                });
            }
            else {
              loading.dismiss();
              this.showAlert(translations[3], translations[4]);
            }
          },
          (error:any) => {
            loading.dismiss();
            this.showAlert(translations[3], translations[4]);
          });
      });
    }
  }

  showDeployment(deployment:Deployment) {
    this.trackEvent("Deployments", "login", this.deployment.website);
    this.closePage({
      deployment: deployment });
  }

  onCancel(event:any=null) {
    this.logger.info(this, "onCancel");
    this.closePage();
  }

  loadDeployment():Promise<any> {
    this.logger.info(this, "loadDeployment");
    return new Promise((resolve, reject) => {
      this.api.getDeployment(this.deployment, false, this.offline).then(
        (deployment:Deployment) => {
          this.logger.info(this, "loadDeployment", "Loaded", deployment);
          this.deployment.copyInto(deployment);
          this.database.saveDeployment(this.deployment).then((saved:boolean) => {
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

  showPasswordReset(event) {
    this.language.getTranslations([
      'USER_PASSWORD_FORGOT_QUESTION',
      'USER_EMAIL',
      'ACTION_CANCEL',
      'USER_PASSWORD_RESET']).then((translations:string[]) => {
        let prompt = this.alertController.create({
          title: translations[0],
          inputs: [
            {
              name: 'email',
              type: 'email',
              value: this.username.value,
              placeholder: translations[1]
            },
          ],
          buttons: [
            {
              text: translations[2]
            },
            {
              text: translations[3],
              handler: data => {
                this.passwordReset(data['email']);
              }
            }
          ]
        });
        prompt.present();
    });
  }

  passwordReset(email:string) {
    this.logger.info(this, "passwordReset", email);
    this.language.getTranslations([
      'USER_PASSWORD_RESETTING_',
      'USER_PASSWORD_RESET_SUCCESS',
      'USER_PASSWORD_RESET_FAILURE']).then((translations:string[]) => {
        let loading = this.showLoading(translations[0]);
        this.api.passwordReset(this.deployment, email).then((reset:any) => {
          this.logger.info(this, "passwordReset", email, reset);
          loading.dismiss();
          this.showToast(translations[1]);
        },
        (error:any) => {
          this.logger.error(this, "passwordReset", email, error);
          loading.dismiss();
          this.showAlert(translations[2], error);
        });
    });
  }

}
