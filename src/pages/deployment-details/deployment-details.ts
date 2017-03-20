import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, NavParams, Content,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { PLACEHOLDER_BLANK } from '../../constants/placeholders';

import { Deployment } from '../../models/deployment';
import { User } from '../../models/user';
import { Form } from '../../models/form';
import { Attribute } from '../../models/attribute';
import { Collection } from '../../models/collection';
import { Post } from '../../models/post';

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
  entryComponents:[ DeploymentLoginPage, DeploymentSettingsPage, ResponseAddPage, ResponseListPage ]
})
export class DeploymentDetailsPage extends BasePage {

  deployment: Deployment = null;
  user: User = null;
  placeholder: string = PLACEHOLDER_BLANK;

  @ViewChild(Content)
  content: Content;

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

    ionViewWillEnter() {
      super.ionViewWillEnter();
      this.platform.ready().then(() => {
        StatusBar.styleLightContent();
        StatusBar.backgroundColorByHexString('#3f4751');
      });
      if (this.deployment == null) {
        this.deployment = this.getParameter<Deployment>("deployment");
      }
      this.loadUpdates(null, true);
    }

    loadUpdates(event:any=null, cache:boolean=false) {
      this.logger.info(this, "loadUpdates");
      let updates = [
        this.loadDeployment(cache),
        this.loadUser(cache),
        this.loadForms(cache),
        this.loadCollections(cache)];
      Promise.all(updates).then(
        (updated) => {
          this.logger.info(this, "loadUpdates", "Finished");
          if (event) {
            event.complete();
          }
        },
        (error) => {
          this.logger.error(this, "loadUpdates", "Failed", error);
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
    }

    loadUser(cache:boolean=true):Promise<any> {
      this.logger.info(this, "loadUser", cache);
      if (cache && this.user) {
        this.logger.info(this, "loadUser", "Cached", this.user);
        return Promise.resolve();
      }
      else if (this.deployment.hasUsername() == false) {
        this.logger.info(this, "loadUser", "No Username");
        return Promise.resolve();
      }
      else if (this.deployment.hasPassword() == false) {
        this.logger.info(this, "loadUser", "No Password");
        return Promise.resolve();
      }
      else {
        return new Promise((resolve, reject) => {
          this.api.getUser(this.deployment).then(
            (user:User) => {
              this.logger.info(this, "loadUser", "Loaded", user);
              this.user = user;
              this.deployment.user_id = user.id;
              let saves = [
                this.database.saveDeployment(this.deployment),
                this.database.saveUser(this.deployment, this.user)
              ];
              Promise.all(saves).then(
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
              this.logger.info(this, "loadForms", "Loaded", forms);
              this.deployment.forms = forms;
              resolve();
            },
            (error:any) => {
              this.logger.error(this, "loadForms", "Failed", error);
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
              this.logger.info(this, "loadCollections", "Loaded", collections);
              this.deployment.collections = collections;
              resolve();
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
        { deployment: this.deployment });
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
      let url = this.deployment.website;
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

    userLogin(event:any) {
      this.logger.info(this, "userLogin");
      this.showPage(DeploymentLoginPage,
        { deployment: this.deployment });
    }

    userLogout(event:any) {
      this.logger.info(this, "userLogout");
      let loading = this.showLoading("Logging out...");
      let updates = [
        this.updateDeployment(),
        this.updatePosts(),
        this.updateForms(),
        this.updateAttributes(),
        this.updateCollections()
      ];
      Promise.all(updates).then(
        (updated) => {
          loading.dismiss();
          this.showToast('Logout Successful');
        },
        (error) => {
          loading.dismiss();
          this.showAlert('Problem Logging Out', error);
      });
    }

    updateDeployment() {
      this.deployment.username = "";
      this.deployment.password = "";
      this.deployment.access_token = "";
      this.deployment.refresh_token = "";
      this.deployment.can_create = false;
      this.deployment.can_update = false;
      this.deployment.can_delete = false;
      return this.database.saveDeployment(this.deployment);
    }

    updatePosts() {
      return new Promise((resolve, reject) => {
        this.database.getPosts(this.deployment).then((posts:Post[]) => {
          let updates = [];
          for (let post of posts) {
            post.can_create = false;
            post.can_update = false;
            post.can_delete = false;
            updates.push(this.database.savePost(this.deployment, post));
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

    updateForms() {
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

    updateAttributes() {
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

    updateCollections() {
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
