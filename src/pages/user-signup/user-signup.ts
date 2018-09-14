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
  selector: 'user-signup-page',
  templateUrl: 'user-signup.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
})
export class UserSignupPage extends BasePage {

  login: Login = null;
  deployment: Deployment = null;

  @ViewChild('name')
  name: TextInput;

  @ViewChild('email')
  email: TextInput;

  @ViewChild('password')
  password: TextInput;

  @ViewChild('confirm')
  confirm: TextInput;

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
    this.loadStatusBar(true, false);
    this.deployment = this.getParameter<Deployment>("deployment");
    this.login = this.getParameter<Login>("login");
    if (this.login && this.login.username) {
      this.email.value = this.login.username;
    }
  }

  private userSignup(event:any) {
    this.logger.info(this, "userSignup");
    let name = this.name.value.toString();
    let email = this.email.value.toString();
    let password = this.password.value.toString();
    let confirm = this.password.value.toString();
    if (name.length == 0) {
      this.language.getTranslation('USER_NAME').then((translation:string) => {
        this.showToast(translation);
        setTimeout(() => {
          this.name.setFocus();
        }, 800);
      });
    }
    else if (email.length == 0) {
      this.language.getTranslation('USER_EMAIL_REQUIRED').then((translation:string) => {
        this.showToast(translation);
        setTimeout(() => {
          this.email.setFocus();
        }, 800);
      });
    }
    else if (password.length == 0) {
      this.language.getTranslation('USER_PASSWORD_REQUIRED').then((translation:string) => {
        this.showToast(translation);
        setTimeout(() => {
          this.password.setFocus();
        }, 800);
      });
    }
    else if (confirm.length == 0) {
      this.language.getTranslation('USER_PASSWORD_CONFIRM').then((translation:string) => {
        this.showToast(translation);
        setTimeout(() => {
          this.confirm.setFocus();
        }, 800);
      });
    }
    else if (password !== confirm) {
      this.language.getTranslation('USER_PASSWORD_CONFIRM').then((translation:string) => {
        this.showToast(translation);
        setTimeout(() => {
          this.password.setFocus();
        }, 800);
      });
    }
    else {
      this.language.getTranslations([
        'USER_SIGNING_UP_',
        'USER_SIGNUP_SUCCESS',
        'USER_SIGNUP_FAILURE']).then((translations:string[]) => {
        let loading = this.showLoading(translations[0]);
        this.api.userSignup(this.deployment, email, password, name).then(
          (login:Login) => {
            this.logger.info(this, "userSignup", login);
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
          },
          (error:any) => {
            loading.dismiss();
            this.showAlert(translations[2], error);
          });
      });
    }
  }

  private showDeployment(deployment:Deployment) {
    this.logger.event(this, "Deployments", "signup", this.deployment.website);
    this.closePage({
      deployment: deployment
    });
  }

  private onCancel(event:any=null) {
    this.logger.info(this, "onCancel");
    this.closePage();
  }

  private loadDeployment():Promise<any> {
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

  private loadForms():Promise<any> {
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

  private loadCollections():Promise<any> {
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

  private removePosts():Promise<any> {
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

  private submitOnReturn(event:any):boolean {
    if (this.isKeyReturn(event)) {
      this.hideKeyboard();
      setTimeout(() => {
        this.userSignup(event);
      }, 600);
      return false;
    }
    return true;
  }

}
