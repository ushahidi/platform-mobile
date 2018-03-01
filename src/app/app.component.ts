import { Component, Injector, ViewChild, NgZone } from '@angular/core';
import { Alert, Toast, Loading, Events, Nav, Platform, ModalController, LoadingController, ToastController, AlertController, MenuController } from 'ionic-angular';

import { Network } from '@ionic-native/network';
import { StatusBar } from '@ionic-native/status-bar';
import { AppVersion } from '@ionic-native/app-version';
import { SplashScreen } from '@ionic-native/splash-screen';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

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

import { PrivacyPolicyPage } from '../pages/privacy-policy/privacy-policy';
import { WhitelabelIntroPage } from '../pages/whitelabel-intro/whitelabel-intro';

import { DEPLOYMENT_ADDED, DEPLOYMENT_DELETED } from '../constants/events';

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
  acceptedTerms:boolean = false;
  i18n:string = "en";
  direction:string = "ltr";
  deploymentApi:string = null;
  tablet:boolean = false;
  orientation:string = "portrait";
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
    private statusBar:StatusBar,
    private splashScreen:SplashScreen,
    private screenOrientation:ScreenOrientation,
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
    this.platform.ready()
      .then(() => this.loadSettings())
      .then(() => this.loadLanguages())
      .then(() => this.loadNetwork())
      .then(() => this.loadOrientation())
      .then(() => this.loadSplitPane())
      .then(() => this.loadAnalytics())
      .then(() => this.loadEvents())
      .then(() => this.loadApplication([
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
          new Filter()]));
  }

  loadSettings() {
    this.settings.getDeploymentUrl().then((url:string) => {
      let whitelabel = (url && url.length > 0);
      this.logger.info(this, 'loadSettings', "Whitelabel", whitelabel);
      this.whitelabel = whitelabel;
    },
    (error:any) => {
      this.logger.info(this, 'loadSettings', "Whitelabel", "False");
      this.whitelabel = false;
    });
    this.settings.getAcceptedTerms().then((acceptedTerms:boolean) => {
      this.logger.info(this, 'loadSettings', "Accepted Terms", acceptedTerms);
      this.acceptedTerms = acceptedTerms;
    },
    (error:any) => {
      this.logger.info(this, 'loadSettings', "Accepted Terms", "False");
      this.acceptedTerms = false;
    });
  }

  loadEvents() {
    this.events.subscribe(DEPLOYMENT_ADDED, (deployment_id:number) => {
      this.logger.info(this, 'Events', DEPLOYMENT_ADDED, deployment_id);
      this.loadDeployments().then((deployments:Deployment[]) => {
        this.logger.info(this, 'Events', DEPLOYMENT_ADDED, "loadDeployments");
      },
      (error:any) => {
        this.logger.info(this, 'Events', DEPLOYMENT_ADDED, error);
      })
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
      (error:any) => {
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

  private loadSplitPane() {
    if (this.platform.is('tablet')) {
      this.logger.info(this, "loadSplitPane", "YES");
      this.tablet = true;
    }
    else {
      this.logger.info(this, "loadSplitPane", "NO");
      this.tablet = false;
    }
  }

  private loadOrientation() {
    this.logger.info(this, "loadOrientation", this.screenOrientation.type);
    this.screenOrientation.unlock();
    this.orientation = this.screenOrientation.type.replace('-primary','').replace('-secondary','');
    this.screenOrientation.onChange().subscribe(() => {
      this.logger.info(this, "Orientation", this.screenOrientation.type);
      this.orientation = this.screenOrientation.type.replace('-primary','').replace('-secondary','');
   });
  }

  private loadNetwork() {
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

  private loadAnalytics() {
    this.settings.getGoogleAnalytics().then((id:string) => {
      if (id && id.length > 0) {
        this.appVersion.getVersionCode().then((appVersion) => {
          this.logger.info(this, "loadAnalytics", "App Version", appVersion);
          this.googleAnalytics.setAppVersion(appVersion);
        },
        (error:any) => {
          this.logger.error(this, "loadAnalytics", "App Version", error);
        });
        this.googleAnalytics.startTrackerWithId(id).then(() => {
          this.logger.info(this, "loadAnalytics", "Google Analytics", id, "Loaded");
        })
        .catch((error) => {
          this.logger.error(this, "loadAnalytics", "Google Analytics", id, "Failed", error);
        });
        this.googleAnalytics.setAllowIDFACollection(false).then((enabled:any) => {
          this.logger.info(this, "loadAnalytics", "Google Analytics", id, "AllowIDFACollection", false);
        },
        (error:any) => {
          this.logger.error(this, "loadAnalytics", "Google Analytics", id, "AllowIDFACollection", error);
        });
        this.googleAnalytics.enableUncaughtExceptionReporting(true).then((enabled:any) => {
          this.logger.info(this, "loadAnalytics", "Google Analytics", id, "EnableUncaughtExceptionReporting", true);
        },
        (error:any) => {
          this.logger.error(this, "loadAnalytics", "Google Analytics", id, "EnableUncaughtExceptionReporting", error);
        });
      }
      else {
        this.logger.info(this, "loadAnalytics", "Google Analytics", "Disabled");
      }
    },
    (error:any) => {
      this.logger.error(this, "loadAnalytics", "Google Analytics", "Disabled", error);
    });
  }

  private loadLanguages() {
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

  private setLanguage(i18n:string) {
    this.logger.info(this, "setLanguage", i18n);
    this.i18n = i18n;
    this.language.setLanguage(i18n);
    this.direction = this.language.getDirection();
  }

  private loadDatabase(models:Model[]):Promise<any> {
    this.logger.info(this, "loadDatabase");
    return this.database.loadDatabase(models);
  }

  private resetDatabase():Promise<any> {
    this.logger.info(this, "resetDatabase");
    return this.database.deleteDatabase();
  }

  private loadDeployments(event:any=null):Promise<Deployment[]> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadDeployments");
      this.database.getDeployments().then(
        (deployments:Deployment[]) => {
          this.logger.info(this, "loadDeployments", deployments);
          this.zone.run(() => {
            this.deployments = deployments;
            if (this.deployments.length > 0 && this.deployment == null) {
              this.deployment = this.deployments[0];
              this.deploymentApi = this.deployment.api;
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

  private showRootPage(deployments:Deployment[]=null) {
    if (this.acceptedTerms == false) {
      this.logger.info(this, "showRootPage", "PrivacyPolicyPage", this.acceptedTerms);
      this.rootPage = PrivacyPolicyPage;
      this.splashScreen.hide();
    }
    else if (deployments && deployments.length > 0) {
      this.logger.info(this, "showRootPage", "showDeployment", deployments.length);
      this.showDeployment(this.deployment).then((ready) => {
        this.splashScreen.hide();
      });
    }
    else if (this.whitelabel == true) {
      this.logger.info(this, "showRootPage", "WhitelabelIntroPage", this.whitelabel);
      this.rootPage = WhitelabelIntroPage;
      this.splashScreen.hide();
    }
    else {
      this.logger.info(this, "showRootPage", "DeploymentNonePage");
      this.rootPage = DeploymentNonePage;
      this.splashScreen.hide();
    }
  }

  private addDeployment(event:any) {
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

  private changeDeployment(deployment:Deployment):Promise<any> {
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

  private showDeployment(deployment:Deployment):Promise<any> {
    this.logger.info(this, "showDeployment", deployment);
    this.deployment = deployment;
    this.deploymentApi = deployment.api;
    return this.api.userOrClientLogin(deployment, this.offline).then(
      (login:Login) => {
        this.menuController.close();
        this.nav.setRoot(
          DeploymentDetailsPage,
          { deployment: deployment });
      },
      (error:any) => {
        this.logger.error(this, "showDeployment", error);
        this.menuController.close();
        this.nav.setRoot(
          DeploymentDetailsPage,
          { deployment: deployment });
    });
  }

  private removeDeployment(deployment:Deployment) {
    this.language.getTranslations([
      'DEPLOYMENT_REMOVING_',
      'DEPLOYMENT_REMOVE_DESCRIPTION']).then((translations:string[]) => {
      this.logger.info(this, "removeDeployment", deployment.name);
      this.logger.event(this, "Deployments", "removed", deployment.website);
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
          this.events.publish(DEPLOYMENT_DELETED, deployment.id);
          this.database.getDeployments().then(_deployments => {
            loading.dismiss();
            this.zone.run(() => {
              this.deployments = <any[]>_deployments;
              if (this.deployments.length == 0) {
                this.deployment = null;
                this.deploymentApi = null;
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

  private showLoading(message:string):Loading {
    let loading = this.loadingController.create({
      content: message
    });
    loading.present();
    return loading;
  }

  private showAlert(title:string, subTitle:string, buttons:any=['OK']):Alert {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: buttons
    });
    alert.present();
    return alert;
  }

  private showToast(message:string, duration:number=1500):Toast {
    let toast = this.toastController.create({
      message: message,
      duration: duration
    });
    toast.present();
    return toast;
  }

}
