import { Component, NgZone, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Platform, Content, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController, Loading } from 'ionic-angular';

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
import { UserLoginPage } from '../../pages/user-login/user-login';
import { UserSignupPage } from '../../pages/user-signup/user-signup';
import { DeploymentSettingsPage } from '../../pages/deployment-settings/deployment-settings';
import { ResponseAddPage } from '../../pages/response-add/response-add';
import { ResponseListPage } from '../../pages/response-list/response-list';

@Component({
  selector: 'deployment-details-page',
  templateUrl: 'deployment-details.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ UserLoginPage, UserSignupPage, DeploymentSettingsPage, ResponseAddPage, ResponseListPage ],
  animations: [
    trigger('fadeInOut', [
      state('1', style({ opacity: 1 })),
      state('0', style({ opacity: 0 })),
      transition('0 => 1', animate('900ms ease-in')),
      transition('1 => 0', animate('300ms ease-out'))
    ])
  ]
})
export class DeploymentDetailsPage extends BasePage {

  login: Login = null;
  deployment: Deployment = null;
  placeholder: string = PLACEHOLDER_BLANK;
  loaded:boolean = false;
  truncated:boolean = true;

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

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.loaded = false;
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.truncated = true;
    this.loadStatusBar(true, false);
    if (this.deployment == null) {
      this.deployment = this.getParameter<Deployment>("deployment");
    }
    this.logger.info(this, "ionViewWillEnter", "Deployment", this.deployment);
    if (this.deployment.forms == null || this.deployment.forms.length == 0) {
      this.language.getTranslation("LOADING_").then((text:string) => {
        let loading = this.showLoading(text);
        this.loadUpdates(false, null, loading).then((loaded) => {
          this.logger.info(this, "ionViewWillEnter", "Loaded");
          loading.dismiss();
        });
      });
    }
    else {
      this.loadUpdates(true).then((loaded) => {
        this.logger.info(this, "ionViewWillEnter", "Loaded");
      });
    }
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.loadStatusBar(true, false);
  }

  private loadUpdates(cache:boolean=false, event:any=null, loading:Loading=null) {
    this.logger.info(this, "loadUpdates", cache);
    if (cache == false) {
      this.loaded = false;
    }
    return Promise.resolve()
      .then(() => { return this.loadLogin(false, loading); })
      .then(() => { return this.loadDeployment(cache, loading); })
      .then(() => { return this.loadForms(cache, loading); })
      .then(() => { return this.loadTags(cache, loading); })
      .then(() => { return this.loadCollections(cache, loading); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Finished");
        if (event) {
          event.complete();
        }
        this.loaded = true;
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
        this.loaded = true;
      });
  }

  private loadLogin(cache:boolean=true, loading:Loading=null):Promise<Login> {
    this.logger.info(this, "loadLogin", cache);
    if (loading) {
      this.language.getTranslation('USER_').then((translation:string) => {
        loading.setContent(translation);
      });
    }
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

  private loadDeployment(cache:boolean=true, loading:Loading=null):Promise<Deployment> {
    this.logger.info(this, "loadDeployment", cache);
    if (loading) {
      this.language.getTranslation('DEPLOYMENT_').then((translation:string) => {
        loading.setContent(translation);
      });
    }
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
            this.database.saveDeployment(this.deployment).then((saved:boolean) => {
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

  private loadForms(cache:boolean=true, loading:Loading=null):Promise<Form[]> {
    this.logger.info(this, "loadForms", cache);
    if (loading) {
      this.language.getTranslation('SURVEYS_').then((translation:string) => {
        loading.setContent(translation);
      });
    }
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
            for (let form of forms) {
              for (let attribute of form.attributes) {
                this.logger.info(this, "loadForms", "Form", form.name, "Attribute", attribute.label, "Tags", attribute.tags);
              }
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

  private loadTags(cache:boolean=true, loading:Loading=null):Promise<Tag[]> {
    this.logger.info(this, "loadTags", cache);
    if (loading) {
      this.language.getTranslation('CATEGORIES_').then((translation:string) => {
        loading.setContent(translation);
      });
    }
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

  private loadCollections(cache:boolean=true, loading:Loading=null):Promise<Collection[]> {
    this.logger.info(this, "loadCollections", cache);
    if (loading) {
      this.language.getTranslation('COLLECTIONS_').then((translation:string) => {
        loading.setContent(translation);
      });
    }
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

  private showResponses(event:any) {
    this.logger.info(this, "showResponses");
    this.showPage(ResponseListPage,
      { deployment: this.deployment,
        login: this.login });
  }

  private showCollections(event:any) {
    this.logger.info(this, "showCollections");
  }

  private showSettings(event:any) {
    this.logger.info(this, "showSettings");
    this.showModal(DeploymentSettingsPage,
      { deployment: this.deployment });
  }

  private addResponse(event:any) {
    this.logger.info(this, "addResponse");
    if (this.deployment.forms.length == 1) {
      let form = this.deployment.forms[0];
      this.showResponseAdd(form);
    }
    else if (this.deployment.forms.length > 1) {
      this.language.getTranslations([
        'ACTION_CANCEL',
        'SURVEY_SUBMIT_RESPONSE']).then((translations:string[]) => {
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
          text: translations[0],
          role: 'cancel' });
        this.showActionSheet(translations[1], buttons);
      });
    }
  }

  private showResponseAdd(form:Form) {
    this.logger.info(this, "showResponseAdd", form.name);
    let modal = this.showModal(ResponseAddPage,
      { deployment: this.deployment,
        login: this.login,
        form: form });
    modal.onDidDismiss(data => {
      this.logger.info(this, "showResponseAdd", "Modal", data);
    });
  }

  private shareDeployment(event:any) {
    this.language.getTranslations(['DEPLOYMENT_SHARED']).then((translations:string[]) => {
      let subject = this.deployment.name;
      let message = this.deployment.description
      let file = this.deployment.image;
      let url = this.deployment.website;
      this.logger.info(this, "shareDeployment", "Subject", subject, "Message", message, "File", file, "URL", url);
      this.showShare(subject, message, file, url).then(
        (shared) => {
          if (shared) {
            this.showToast(translations[0]);
            this.logger.event(this, "Deployments", "shared", this.deployment.website);
          }
        },
        (error) => {
          this.showToast(error);
      });
    });
  }

  private userLogin(event:any) {
    this.logger.info(this, "userLogin");
    this.showModal(UserLoginPage,
      { deployment: this.deployment });
  }

  private userSignup(event:any) {
    this.logger.info(this, "userSignup");
    this.showModal(UserSignupPage,
      { deployment: this.deployment });
  }

  private userLogout(event:any) {
    this.logger.info(this, "userLogout");
    this.logger.event(this, "Deployments", "logout", this.deployment.website);
    this.language.getTranslations([
      'USER_LOGGING_OUT_',
      'USER_LOGOUT_SUCCESS',
      'USER_LOGOUT_FAILURE']).then((translations:string[]) => {
      let loading = this.showLoading(translations[0]);
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
              this.showToast(translations[1]);
            });
          },
          (error:any) => {
            loading.dismiss();
            this.showAlert(translations[2], error);
          });
    });
  }

  private demoteDeployment() {
    this.deployment.can_create = false;
    this.deployment.can_update = false;
    this.deployment.can_delete = false;
    return this.database.saveDeployment(this.deployment);
  }

  private demotePosts() {
    return new Promise((resolve, reject) => {
      this.database.removePosts(this.deployment).then((removed:any) => {
        resolve(removed);
      });
    });
  }

  private demoteForms() {
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

  private demoteStages() {
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

  private demoteAttributes() {
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

  private demoteCollections() {
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

  private readMore(event:any) {
    this.logger.info(this, "readMore");
    this.truncated = false;
  }

}
