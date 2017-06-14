import { Component, NgZone, ViewChild, state, style, animate, transition, trigger } from '@angular/core';
import { Platform, Content, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { PLACEHOLDER_BLANK } from '../../constants/placeholders';

import { Login } from '../../models/login';
import { Deployment } from '../../models/deployment';
import { Form } from '../../models/form';
import { Stage } from '../../models/stage';
import { Attribute } from '../../models/attribute';
import { Collection } from '../../models/collection';
import { Tag } from '../../models/tag';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';
import { DeploymentLoginPage } from '../../pages/deployment-login/deployment-login';
import { DeploymentSettingsPage } from '../../pages/deployment-settings/deployment-settings';
import { ResponseAddPage } from '../../pages/response-add/response-add';
import { ResponseListPage } from '../../pages/response-list/response-list';

@Component({
  selector: 'deployment-details-page',
  templateUrl: 'deployment-details.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ DeploymentLoginPage, DeploymentSettingsPage, ResponseAddPage, ResponseListPage ],
  animations: [
    trigger('fadeInOut', [
      state('true', style({ opacity: 0 })),
      state('false', style({ opacity: 1 })),
      transition('0 => 1', animate('900ms')),
      transition('1 => 0', animate('300ms'))
    ])
  ]
})
export class DeploymentDetailsPage extends BasePage {

  login: Login = null;
  deployment: Deployment = null;
  placeholder: string = PLACEHOLDER_BLANK;
  refreshing:boolean = false;

  @ViewChild(Content)
  content: Content;

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
    protected database:DatabaseService) {
    super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, logger);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.loadStatusBar(true);
    if (this.deployment == null) {
      this.deployment = this.getParameter<Deployment>("deployment");
    }
    if (this.deployment.forms == null || this.deployment.forms.length == 0) {
      let loading = this.showLoading("Loading...");
      this.loadUpdates(null, true).then((loaded) => {
        this.logger.info(this, "ionViewWillEnter", "Loaded");
        loading.dismiss();
      });
    }
    else {
      this.loadUpdates(null, true).then((loaded) => {
        this.logger.info(this, "ionViewWillEnter", "Loaded");
      });
    }
  }

  loadUpdates(event:any=null, cache:boolean=false) {
    this.logger.info(this, "loadUpdates", cache);
    this.refreshing = true;
    return Promise.resolve()
      .then(() => { return this.loadLogin(false); })
      .then(() => { return this.loadDeployment(cache); })
      .then(() => { return this.loadForms(cache); })
      .then(() => { return this.loadTags(cache); })
      .then(() => { return this.loadCollections(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Finished");
        if (event) {
          event.complete();
        }
        this.refreshing = false;
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.refreshing = false;
      });
  }

  loadLogin(cache:boolean=true):Promise<Login> {
    this.logger.info(this, "loadLogin", cache);
    if (cache && this.login) {
      this.logger.info(this, "loadLogin", "Cached", this.login);
      return Promise.resolve(this.login);
    }
    else {
      return new Promise((resolve, reject) => {
        this.api.userOrClientLogin(this.deployment, this.offline).then(
          (login:Login) => {
            this.logger.info(this, "loadLogin", "Loaded", login);
            this.login = login;
            resolve(login);
          },
          (error:any) => {
            this.logger.error(this, "loadLogin", "Failed", error);
            reject(error);
          });
      });
    }
  }

  loadDeployment(cache:boolean=true):Promise<Deployment> {
    this.logger.info(this, "loadDeployment", cache);
    if (cache && (this.deployment.image || this.deployment.description)) {
      this.logger.info(this, "loadDeployment", "Cached");
      return Promise.resolve(this.deployment);
    }
    else {
      return new Promise((resolve, reject) => {
        this.api.getDeployment(this.deployment, cache, this.offline).then(
          (deployment:Deployment) => {
            this.logger.info(this, "loadDeployment", "Loaded", deployment);
            this.deployment.copyInto(deployment);
            this.database.saveModel(this.deployment).then(
              (saved:any) => {
                this.logger.info(this, "loadDeployment", "Saved", saved);
                resolve(this.deployment);
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
  }

  loadForms(cache:boolean=true):Promise<Form[]> {
    this.logger.info(this, "loadForms", cache);
    if (cache && this.deployment.hasForms()) {
      this.logger.info(this, "loadForms", "Cached");
      return Promise.resolve(this.deployment.forms);
    }
    else {
      return new Promise((resolve, reject) => {
        this.api.getFormsWithAttributes(this.deployment, cache, this.offline).then(
          (forms:Form[]) => {
            if (forms) {
              this.logger.info(this, "loadForms", "Loaded", forms.length);
            }
            else {
              this.logger.info(this, "loadForms", "Loaded", 0);
            }
            this.deployment.forms = forms;
            resolve(forms);
          },
          (error:any) => {
            this.logger.error(this, "loadForms", "Failed", error);
            reject(error);
          });
      });
    }
  }

  loadTags(cache:boolean=true):Promise<Tag[]> {
    this.logger.info(this, "loadTags", cache);
    if (cache && this.deployment.hasTags()) {
      this.logger.info(this, "loadTags", "Cached");
      return Promise.resolve(this.deployment.tags);
    }
    else {
      return new Promise((resolve, reject) => {
        this.api.getTags(this.deployment, cache, this.offline).then(
          (tags:Tag[]) => {
            if (tags) {
              this.logger.info(this, "loadTags", "Loaded", tags.length);
            }
            else {
              this.logger.info(this, "loadTags", "Loaded", 0);
            }
            this.deployment.tags = tags;
            resolve(tags);
          },
          (error:any) => {
            this.logger.error(this, "loadTags", "Failed", error);
            reject(error);
          });
      });
    }
  }

  loadCollections(cache:boolean=true):Promise<Collection[]> {
    this.logger.info(this, "loadCollections", cache);
    if (cache && this.deployment.hasCollections()) {
      this.logger.info(this, "loadCollections", "Cached");
      return Promise.resolve(this.deployment.collections);
    }
    else {
      return new Promise((resolve, reject) => {
        this.api.getCollections(this.deployment, cache, this.offline).then(
          (collections:Collection[]) => {
            if (collections) {
              this.logger.info(this, "loadCollections", "Loaded", collections.length);
            }
            else {
              this.logger.info(this, "loadCollections", "Loaded", 0);
            }
            this.deployment.collections = collections;
            resolve(collections);
          },
          (error:any) => {
            this.logger.error(this, "loadCollections", "Failed", error);
            reject(error);
          });
      });
    }
  }

  showResponses(event:any) {
    this.logger.info(this, "showResponses");
    this.showPage(ResponseListPage,
      { deployment: this.deployment,
        login: this.login });
  }

  showCollections(event:any) {
    this.logger.info(this, "showCollections");
    this.showToast('Collections Not Implemented');
  }

  showSettings(event:any) {
    this.logger.info(this, "showSettings");
    this.showModal(DeploymentSettingsPage,
      { deployment: this.deployment });
  }

  addResponse(event:any) {
    this.logger.info(this, "addResponse");
    let buttons = [];
    if (this.deployment.forms) {
      for (let form of this.deployment.forms) {
        if (form.canSubmit(this.login)) {
          buttons.push({
            text: form.name,
            handler: () => {
              this.logger.info(this, "addResponse", "Form", form.name);
              this.showResponseAdd(form);
          }});
        }
      }
    }
    buttons.push({
      text: 'Cancel',
      role: 'cancel' });
    this.showActionSheet('Submit Survey Response', buttons);
  }

  showResponseAdd(form:Form) {
    this.logger.info(this, "showResponseAdd", form.name);
    let modal = this.showModal(ResponseAddPage,
      { deployment: this.deployment,
        login: this.login,
        form: form });
    modal.onDidDismiss(data => {
      this.logger.info(this, "showResponseAdd", "Modal", data);
    });
  }

  shareDeployment(event:any) {
    let subject = this.deployment.name;
    let message = this.deployment.description
    let file = this.deployment.image;
    let url = this.deployment.website;
    this.logger.info(this, "shareDeployment", "Subject", subject, "Message", message, "File", file, "URL", url);
    this.showShare(subject, message, file, url).then(
      (shared) => {
        if (shared) {
          this.showToast("Deployment Shared");
          this.trackEvent("Deployments", "shared", this.deployment.website);
        }
      },
      (error) => {
        this.showToast(error);
    });
  }

  userLogin(event:any) {
    this.logger.info(this, "userLogin");
    this.showPage(DeploymentLoginPage,
      { deployment: this.deployment });
  }

  userLogout(event:any) {
    this.logger.info(this, "userLogout");
    this.trackEvent("Deployments", "logout", this.deployment.website);
    let loading = this.showLoading("Logging out...");
    return Promise.all([
      this.demoteDeployment(),
      this.demotePosts(),
      this.demoteForms(),
      this.demoteStages(),
      this.demoteAttributes(),
      this.demoteCollections()]).then(
        (done:any) => {
          this.api.clientLogin(this.deployment).then((login:Login) => {
            this.logger.info(this, "userLogout", "clientLogin", login);
            this.login = login;
            loading.dismiss();
            this.showToast('Logout Successful');
          });
        },
        (error:any) => {
          loading.dismiss();
          this.showAlert('Problem Logging Out', error);
        });
  }

  demoteDeployment() {
    this.deployment.can_create = false;
    this.deployment.can_update = false;
    this.deployment.can_delete = false;
    return this.database.saveDeployment(this.deployment);
  }

  demotePosts() {
    return new Promise((resolve, reject) => {
      this.database.removePosts(this.deployment).then((removed:any) => {
        resolve(removed);
      });
    });
  }

  demoteForms() {
    return new Promise((resolve, reject) => {
      this.database.getForms(this.deployment).then((forms:Form[]) => {
        let updates = [];
        for (let form of forms) {
          form.can_create = false;
          form.can_update = false;
          form.can_delete = false;
          updates.push(this.database.saveForm(this.deployment, form));
        }
        Promise.all(updates).then(
          (updated) => {
            resolve(updated);
          },
          (error) => {
            reject(error);
          });
      });
    });
  }

  demoteStages() {
    return new Promise((resolve, reject) => {
      this.database.getStages(this.deployment).then((stages:Stage[]) => {
        let updates = [];
        for (let stage of stages) {
          stage.can_create = false;
          stage.can_update = false;
          stage.can_delete = false;
          updates.push(this.database.saveStage(this.deployment, stage));
        }
        Promise.all(updates).then(
          (updated) => {
            resolve(updated);
          },
          (error) => {
            reject(error);
          });
      });
    });
  }

  demoteAttributes() {
    return new Promise((resolve, reject) => {
      this.database.getAttributes(this.deployment).then((attributes:Attribute[]) => {
        let updates = [];
        for (let attribute of attributes) {
          attribute.can_create = false;
          attribute.can_update = false;
          attribute.can_delete = false;
          updates.push(this.database.saveAttribute(this.deployment, attribute));
        }
        Promise.all(updates).then(
          (updated) => {
            resolve(updated);
          },
          (error) => {
            reject(error);
          });
      });
    });
  }

  demoteCollections() {
    return new Promise((resolve, reject) => {
      this.database.getCollections(this.deployment).then((collections:Collection[]) => {
        let updates = [];
        for (let collection of collections) {
          collection.can_create = false;
          collection.can_update = false;
          collection.can_delete = false;
          updates.push(this.database.saveCollection(this.deployment, collection));
        }
        Promise.all(updates).then(
          (updated) => {
            resolve(updated);
          },
          (error) => {
            reject(error);
          });
      });
    });
  }

}
