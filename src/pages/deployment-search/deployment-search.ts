import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, Searchbar, Content, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Login } from '../../models/login';
import { Deployment } from '../../models/deployment';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';

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
      this.api.searchDeployments(this.search).then(
        (deployments:Deployment[]) => {
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
    let loading = this.showLoading("Adding...");
    let url = `https://${this.domain}`;
    this.api.registerDeployment(url).then(
      (deployment:Deployment) => {
        loading.dismiss();
        this.loginDeployment(deployment);
      },
      (error:any) => {
        let url = `http://${this.domain}`;
        this.api.registerDeployment(url).then(
          (deployment:Deployment) => {
            loading.dismiss();
            this.loginDeployment(deployment);
          },
          (error:any) => {
            loading.dismiss();
            this.showAlert("Problem Adding Deployment", "The deployment does not have the necessary configuration to be added into the app. If you are the deployer, please upgrade your deployment, otherwise please let the deployer know about the problem.");
          });
      });
  }

  addDeployment(event:any, deployment:Deployment) {
    this.logger.info(this, "addDeployment");
    this.trackEvent("Deployments", "searched", this.search);
    let where = { domain: deployment.domain };
    return this.database.getDeployments(where).then(
      (deployments:Deployment[]) => {
        if (deployments && deployments.length > 0) {
          this.showAlert('Deployment Already Added', 'Looks like that deployment has already been added.');
        }
        else {
          this.trackEvent("Deployments", "added", deployment.website);
          this.loginDeployment(deployment);
        }
      });
  }

  loginDeployment(deployment:Deployment) {
    this.logger.info(this, "loginDeployment");
    let loading = this.showLoading("Adding...");
    return this.api.clientLogin(deployment).then(
      (login:Login) => {
        this.logger.info(this, "loginDeployment", "Tokens", login);
        deployment.copyInto(login);
        this.api.getDeployment(deployment, false).then((details:Deployment) => {
          deployment.copyInto(details);
          this.database.saveDeployment(deployment).then(
            (id:number) => {
              this.logger.info(this, "loginDeployment", "ID", id);
              if (id) {
                deployment.id = id;
                loading.dismiss();
                this.hideModal({
                  deployment : deployment
                });
              }
              else {
                loading.dismiss();
                this.showAlert('Problem Adding Deployment', 'There was a problem adding your deployment.');
              }
            },
            (error:any) => {
              this.logger.error(this, "loginDeployment", error);
              loading.dismiss();
              this.showAlert('Problem Adding Deployment', error);
            });
        });
      },
      (error:any) => {
        this.logger.error(this, "loginDeployment", "Client", error);
        loading.dismiss();
        this.showAlert('Problem Logging In', error);
      });
  }

}
