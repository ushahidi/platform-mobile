import { Component, Injector, ViewChild, NgZone } from '@angular/core';
import { Alert, Toast, Loading, Events, Nav, Platform, ModalController, LoadingController, ToastController, AlertController, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { AppVersion } from '@ionic-native/app-version';
import { Network } from '@ionic-native/network';

import { Model } from '../models/model';
import { Login } from '../models/login';
import { Deployment } from '../models/deployment';
import { User } from '../models/user';
import { Form } from '../models/form';
import { Attribute } from '../models/attribute';
import { Post } from '../models/post';
import { Value } from '../models/value';
import { Image } from '../models/image';
import { Filter } from '../models/filter';
import { Stage } from '../models/stage';
import { Collection } from '../models/collection';
import { Tag } from '../models/tag';

import { ApiService } from '../providers/api-service';
import { LoggerService } from '../providers/logger-service';
import { DatabaseService } from '../providers/database-service';
import { InjectorService } from '../providers/injector-service';
import { LanguageService } from '../providers/language-service';
import { SettingsService } from '../providers/settings-service';

import { DeploymentNonePage } from '../pages/deployment-none/deployment-none';
import { DeploymentSearchPage } from '../pages/deployment-search/deployment-search';
import { DeploymentDetailsPage } from '../pages/deployment-details/deployment-details';

import { WhitelabelIntroPage } from '../pages/whitelabel-intro/whitelabel-intro';

import { GOOGLE_ANALYTICS_ID } from '../constants/secrets';

declare var window:any;
declare var cordova:any;

@Component({
  templateUrl: 'app.html',
  entryComponents:[ DeploymentNonePage, DeploymentSearchPage, DeploymentDetailsPage, WhitelabelIntroPage ]
})
export class UshahidiApp {

  zone:NgZone = null;
  rootPage:any = null;
  deployment:Deployment = null;
  deployments:Deployment[] = null;
  offline:boolean = false;
  whitelabel:boolean = false;
  i18n:string = "en";
  direction:string = "ltr";
  deploymentApi:string = null;
  languages:any[] = [
    { name: 'English', code: 'en' },
    { name: 'Français', code: 'fr' },
    { name: 'Español', code: 'es' },
    { name: 'Deutsche', code: 'de' },
    { name: 'Português', code: 'pt' },
    { name: 'Italiano', code: 'it' },
    { name: 'Nederlands', code: 'nl' },
    { name: 'Pусский', code: 'ru' },
    { name: 'Kiswahili', code: 'sw' },
    { name: 'Ayisyen', code: 'ht' },
    { name: 'Tiếng Việt', code: 'vi' },
    { name: 'عربى', code: 'ar' },
    { name: '日本語', code: 'jp' },
    { name: '中文', code: 'zh' }
  ];

  @ViewChild(Nav)
  nav: Nav;

  constructor(
    _zone: NgZone,
    private injector:Injector,
    private network:Network,
    private appVersion:AppVersion,
    private googleAnalytics:GoogleAnalytics,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private events:Events,
    private platform: Platform,
    private api:ApiService,
    private logger:LoggerService,
    private database:DatabaseService,
    private language:LanguageService,
    private settings:SettingsService,
    private modalController:ModalController,
    private toastController:ToastController,
    private loadingController:LoadingController,
    private alertController: AlertController,
    private menuController: MenuController) {
    this.zone = _zone;
    InjectorService.injector = injector;
    this.platform.ready().then(() => {
      this.logger.info(this, "Platform Ready", this.platform.platforms());
      this.loadSettings();
      this.loadLanguages();
      this.loadNetwork();
      this.loadStatusBar();
      this.loadAnalytics();
      this.loadApplication([
        new Deployment(),
        new User(),
        new Form(),
        new Stage(),
        new Attribute(),
        new Post(),
        new Value(),
        new Image(),
        new Collection(),
        new Tag(),
        new Filter()]);
    });
  }

  loadSettings() {
    this.settings.getDeploymentUrl().then((url:string) => {
      this.whitelabel = true;
    },
    (error:any) => {
      this.whitelabel = false;
    });
  }

  loadApplication(models:Model[]) {
    this.loadDatabase(models).then(
      (loaded:any) => {
        this.loadDeployments().then(
          (deployments:Deployment[]) => {
            this.showRootPage(deployments);
          },
          (error:any) => {
            this.showRootPage();
          });
      },
      (error) => {
        this.splashScreen.hide();
        this.language.getTranslations([
          'DATABASE_SCHEMA_CHANGED',
          'DATABASE_SCHEMA_CHANGED_DESCRIPTION',
          'DATABASE_RESET',
          'DATABASE_RESETTING_',
          'DATABASE_CREATE_FAILURE',
          'DATABASE_CREATE_FAILURE_DESCRIPTION',
          'DATABASE_RESET_FAILURE',
          'DATABASE_RESET_FAILURE_DESCRIPTION']).then((translations:string[]) => {
            this.showAlert(translations[0], translations[1], [{
              text: translations[2],
              handler: (clicked) => {
                let loading = this.showLoading(translations[3]);
                this.resetDatabase().then(
                  (reset:any) => {
                    this.loadDatabase(models).then(
                      (created:any) => {
                        loading.dismiss();
                        this.showRootPage();
                      },
                      (error:any) => {
                        loading.dismiss();
                        this.showAlert(translations[4], translations[5]);
                      }
                    );
                  },
                  (error:any) => {
                    loading.dismiss();
                    this.showAlert(translations[6], translations[7]);
                });
              }
            }]);
        });
    });
  }

  loadNetwork() {
    this.logger.info(this, "Network", this.network.type);
    if (this.network.type == 'none') {
      this.offline = true;
    }
    else {
      this.offline = false;
    }
    this.network.onConnect().subscribe(() => {
      this.logger.info(this, "Network Connected", this.network.type);
      this.offline = false;
    });
    this.network.onDisconnect().subscribe(() => {
      this.logger.info(this, "Network Disconnected", this.network.type);
      this.offline = true;
    });
  }

  loadStatusBar() {
    this.statusBar.styleDefault();
  }

  loadAnalytics() {
    this.appVersion.getVersionCode().then((appVersion) => {
      this.logger.info(this, "loadAnalytics", "App Version", appVersion);
      this.googleAnalytics.setAppVersion(appVersion);
    });
    this.googleAnalytics.startTrackerWithId(GOOGLE_ANALYTICS_ID)
      .then(() => {
        this.logger.info(this, "loadAnalytics", "Google Analytics", "Ready");
      })
      .catch((error) => {
        this.logger.error(this, "loadAnalytics", "Google Analytics", error);
      });
  }

  loadLanguages() {
    this.language.getLanguage().then(
      (i18n) => {
        this.setLanguage(i18n);
      },
      (error) => {
        this.setLanguage("en");
    });
    this.settings.getAppLanguages().then((appLanguages:string[]) => {
      if (appLanguages && appLanguages.length > 0) {
        this.languages = this.languages.filter(language => appLanguages.indexOf(language.code) != -1);
      }
    });
  }

  setLanguage(i18n:string) {
    this.logger.info(this, "setLanguage", i18n);
    this.i18n = i18n;
    this.language.setLanguage(i18n);
    this.direction = this.language.getDirection();
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

  resetDatabase():Promise<any> {
    this.logger.info(this, "resetDatabase");
    return this.database.deleteDatabase();
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
            if (event) {
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
      this.showDeployment(this.deployment).then((ready) => {
        this.splashScreen.hide();
      });
    }
    else if (this.whitelabel) {
      this.rootPage = WhitelabelIntroPage;
      this.splashScreen.hide();
    }
    else {
      this.rootPage = DeploymentNonePage;
      this.splashScreen.hide();
    }
  }

  addDeployment(event:any) {
    this.logger.info(this, "addDeployment");
    this.menuController.close();
    let modal = this.modalController.create(
      DeploymentSearchPage,
      { });
    modal.present();
    modal.onDidDismiss((data:any) => {
      if (data && data.deployment) {
        this.logger.info(this, "addDeployment", data);
        let deployment:Deployment = data.deployment;
        this.showDeployment(deployment);
      }
    });
  }

  changeDeployment(deployment:Deployment):Promise<any> {
    return new Promise((resolve, reject) => {
      this.language.getTranslation('LOADING_').then((translation:string) => {
        let loading = this.showLoading(translation);
        this.showDeployment(deployment).then((loaded) => {
          loading.dismiss();
          resolve();
        })
      });
    });
  }

  showDeployment(deployment:Deployment):Promise<any> {
    this.logger.info(this, "showDeployment", deployment);
    this.deployment = deployment;
    this.deploymentApi = deployment.api;
    return this.api.userOrClientLogin(deployment, this.offline).then(
      (login:Login) => {
        this.menuController.close();
        this.nav.setRoot(
          DeploymentDetailsPage,
          { deployment: deployment });
    });
  }

  removeDeployment(deployment:Deployment) {
    this.language.getTranslations([
      'DEPLOYMENT_REMOVING_',
      'DEPLOYMENT_REMOVE_DESCRIPTION']).then((translations:string[]) => {
      this.logger.info(this, "removeDeployment", deployment.name);
      this.trackEvent("Deployments", "removed", deployment.website);
      let loading = this.showLoading(translations[0]);
      let promises = [
        this.api.removeLogin(deployment),
        this.database.removeUsers(deployment),
        this.database.removeAttributes(deployment),
        this.database.removeStages(deployment),
        this.database.removeForms(deployment),
        this.database.removeValues(deployment),
        this.database.removeImages(deployment),
        this.database.removePosts(deployment),
        this.database.removeFilters(deployment),
        this.database.removeTags(deployment),
        this.database.removeDeployment(deployment)];
      Promise.all(promises).then(
        (results) => {
          this.database.getDeployments().then(results => {
            loading.dismiss();
            this.zone.run(() => {
              this.deployments = <any[]>results;
              if (this.deployments.length == 0) {
                this.nav.setRoot(DeploymentNonePage);
                this.menuController.close();
              }
              else if (this.deployment.id == deployment.id){
                this.showDeployment(this.deployments[0]);
              }
            });
          });
        },
        (error) => {
          this.logger.error(this, "removeDeployment", error);
          loading.dismiss();
          this.showAlert(translations[1], error);
        });
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

  trackEvent(category:string, action:string, label:string, value:number=0, newSession:boolean=false) {
    this.googleAnalytics.trackEvent(category, action, label, value, newSession).then((tracked) => {
      this.logger.info(this, "trackEvent", category, action, label);
    });
  }

}
