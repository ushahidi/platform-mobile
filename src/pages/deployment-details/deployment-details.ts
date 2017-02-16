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
      super(zone, platform, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
    }

    ionViewDidLoad() {
      super.ionViewDidLoad();
      this.logger.info(this, "ionViewDidLoad");
    }

    ionViewWillEnter() {
      super.ionViewWillEnter();
      this.logger.info(this, "ionViewWillEnter");
      this.platform.ready().then(() => {
        StatusBar.styleLightContent();
        StatusBar.backgroundColorByHexString('#3f4751');
      });
      this.deployment = this.navParams.get("deployment");
      this.loadUpdates(null, true);
    }

    loadUpdates(event:any=null, cache:boolean=false) {
      this.logger.info(this, "loadUpdates");
      let promises = [
        this.loadDeployment(cache),
        this.loadUser(cache),
        this.loadForms(cache),
        this.loadCollections(cache)];
      Promise.all(promises).then(done => {
        if (event) {
          event.complete();
        }
      });
    }

    loadDeployment(cache:boolean=true) {
      this.logger.info(this, "loadDeployment", cache);
      if (cache && this.deployment.image && this.deployment.description) {
        this.logger.info(this, "loadDeployment", "Cached");
      }
      else if (cache) {
        return this.database.getDeployment(this.deployment.id).then(
          (results) => {
            this.logger.info(this, "loadDeployment", "Database", results);
            this.deployment.copyInto(results);
            if (this.deployment.image == null || this.deployment.description == null) {
              this.loadDeployment(false);
            }
          },
          (error) => {
            this.logger.error(this, "loadDeployment", "Database", error);
        });
      }
      else {
        return this.api.getDeployment(this.deployment).then(deployment => {
          this.deployment.copyInto(deployment);
          this.database.saveModel(this.deployment).then(
            (results) => {
              this.logger.info(this, "loadDeployment", "API", results);
            },
            (error) => {
              this.logger.error(this, "loadDeployment", "API", error);
          });
        });
      }
    }

    loadUser(cache:boolean=true) {
      this.logger.info(this, "loadUser", cache);
      if (cache && this.user) {
        this.logger.info(this, "loadUser", "Cached", this.user);
      }
      else {
        return this.api.getUser(this.deployment).then(
          (results) => {
            this.logger.info(this, "loadUser", "API", results);
            this.user = <User>results;
            this.database.saveUser(this.deployment, this.user).then(
              (results) => {
                this.logger.info(this, "loadUser", "Saved", results);
              },
              (error) => {
                this.logger.error(this, "loadUser", "Failed", results);
              });
          },
          (error) => {
            this.logger.error(this, "loadUser", "Failed", error);
          });
      }
    }

    loadForms(cache:boolean=true) {
      this.logger.info(this, "loadForms", cache);
      if (cache && this.deployment.forms != null && this.deployment.forms.length > 0) {
        this.logger.info(this, "loadForms", "Cached");
      }
      else if (cache) {
        return this.database.getFormsWithAttributes(this.deployment).then(results => {
          this.logger.info(this, "loadForms", "Database", results);
          let forms = <Form[]>results;
          if (forms.length > 0) {
            this.deployment.forms = forms;
          }
          else {
            this.loadForms(false);
          }
        });
      }
      else {
        return this.api.getFormsWithAttributes(this.deployment).then(
          (results) => {
            let forms = <Form[]>results;
            this.logger.info(this, "loadForms", "API", forms);
            for (let form of forms) {
              this.database.saveForm(this.deployment, form);
              for (let attribute of form.attributes) {
                this.database.saveAttribute(this.deployment, attribute);
              }
            }
            this.deployment.forms = forms;
          },
          (error) => {
            this.logger.error(this, "loadForms", "API", error);
          });
      }
    }

    loadCollections(cache:boolean=true) {
      this.logger.info(this, "loadCollections", cache);
      if (cache && this.deployment.collections != null && this.deployment.collections.length > 0) {
        this.logger.info(this, "loadCollections", "Cached");
      }
      else if (cache) {
        return this.database.getCollections(this.deployment).then(results => {
          this.logger.info(this, "loadCollections", "Database", results);
          let collections = <Collection[]>results;
          if (collections.length > 0) {
            this.deployment.collections = collections;
          }
          else {
            this.loadCollections(false);
          }
        });
      }
      else {
        return this.api.getCollections(this.deployment).then(
          (results) => {
            let collections = <Collection[]>results;
            this.logger.info(this, "loadCollections", "API", collections);
            for (let collection of collections) {
              this.database.saveCollection(this.deployment, collection);
            }
            this.deployment.collections = collections;
          },
          (error) => {
            this.logger.error(this, "loadCollections", "API", error);
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
