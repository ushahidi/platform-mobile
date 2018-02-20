import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, Events, Searchbar, Content, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Login } from '../../models/login';
import { Deployment } from '../../models/deployment';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';

import { DEPLOYMENT_ADDED } from '../../constants/events';

@Component({
  selector: 'deployment-search-page',
  templateUrl: 'deployment-search.html',
  providers: [ ApiService, DatabaseService, LoggerService ]
})
export class DeploymentSearchPage extends BasePage {

  loading: boolean = false;
  deployments: Deployment[] = [];

  @ViewChild(Content)
  content: Content;

  @ViewChild('searchbar')
  searchbar: Searchbar;

  search:string = null;
  domain:string = null;

  constructor(
    protected zone:NgZone,
    protected events:Events,
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
    if (this.tablet == false) {
      this.loadStatusBar(true);
    }
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.tablet == false) {
      this.loadStatusBar(true);
    }
  }

  onCancel(event:any) {
    this.logger.info(this, "onCancel");
    this.hideModal();
  }

  searchDeployments(event:any) {
    this.logger.info(this, "searchDeployments", event.target.value);
    this.search = event.target.value;
    if (this.search == null) {
      this.loading = false;
      this.deployments = [];
      this.domain = null;
    }
    else if (this.search.indexOf(".") != -1 || this.search.indexOf("http:") != -1 || this.search.indexOf("https:") != -1) {
      this.loading = false;
      this.deployments = [];
      this.domain = this.search.toLowerCase().replace("http://","").replace("https://","");
    }
    else if (this.search.length > 0) {
      this.loading = true;
      this.domain = null;
      this.api.searchDeployments(this.search).then((deployments:Deployment[]) => {
        this.deployments = deployments;
        this.loading = false;
      },
      (error:any) => {
        this.loading = false;
        this.showToast(error);
      });
    }
    else {
      this.loading = false;
      this.deployments = [];
    }
  }

  registerDeployment(event:any) {
    this.logger.info(this, "registerDeployment", this.search);
    this.language.getTranslations([
      'DEPLOYMENT_ADDING_',
      'DEPLOYMENT_CONFIG_FAILURE',
      'DEPLOYMENT_CONFIG_FAILURE_DESCRIPTION']).then((translations:string[]) => {
      let loading = this.showLoading(translations[0]);
      let url = `https://${this.domain}`;
      this.api.registerDeployment(url).then((deployment:Deployment) => {
        loading.dismiss();
        this.loginDeployment(deployment);
      },
      (error:any) => {
        let url = `http://${this.domain}`;
        this.api.registerDeployment(url).then((deployment:Deployment) => {
          loading.dismiss();
          this.loginDeployment(deployment);
        },
        (error:any) => {
          loading.dismiss();
          this.showAlert(translations[1], translations[2]);
        });
      });
    });
  }

  addDeployment(event:any, deployment:Deployment) {
    this.logger.info(this, "addDeployment");
    this.trackEvent("Deployments", "searched", this.search);
    this.language.getTranslations([
      'DEPLOYMENT_ADD_EXISTS',
      'DEPLOYMENT_ADD_EXISTS_DESCRIPTION']).then((translations:string[]) => {
      let where = { domain: deployment.domain };
      return this.database.getDeployments(where).then((deployments:Deployment[]) => {
        if (deployments && deployments.length > 0) {
          this.showAlert(translations[0], translations[1]);
        }
        else {
          this.trackEvent("Deployments", "added", deployment.website);
          this.loginDeployment(deployment);
        }
      });
    });
  }

  loginDeployment(deployment:Deployment) {
    this.logger.info(this, "loginDeployment");
    this.language.getTranslations([
      'DEPLOYMENT_ADDING_',
      'DEPLOYMENT_ADD_FAILURE',
      'DEPLOYMENT_ADD_FAILURE_DESCRIPTION',
      'USER_LOGIN_FAILURE']).then((translations:string[]) => {
      let loading = this.showLoading(translations[0]);
      return this.api.clientLogin(deployment).then((login:Login) => {
        this.logger.info(this, "loginDeployment", "Tokens", login);
        deployment.copyInto(login);
        this.api.getDeployment(deployment, false).then((details:Deployment) => {
          deployment.copyInto(details);
          this.database.saveDeployment(deployment).then((saved:boolean) => {
            this.logger.info(this, "loginDeployment", "Saved", saved);
            if (saved) {
              this.events.publish(DEPLOYMENT_ADDED, deployment.id);
              loading.dismiss();
              this.hideModal({
                deployment : deployment
              });
            }
            else {
              loading.dismiss();
              this.showAlert(translations[1], translations[2]);
            }
          },
          (error:any) => {
            this.logger.error(this, "loginDeployment", error);
            loading.dismiss();
            this.showAlert(translations[1], error);
          });
        });
      },
      (error:any) => {
        this.logger.error(this, "loginDeployment", "Client", error);
        loading.dismiss();
        this.showAlert(translations[3], error);
      });
    });
  }

}
