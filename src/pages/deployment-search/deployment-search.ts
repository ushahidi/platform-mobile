import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, NavParams, Searchbar, Content,
  NavController, ViewController, ModalController, LoadingController, ToastController, AlertController, ActionSheetController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';

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
    public statusBar:StatusBar,
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
      this.statusBar.styleLightContent();
      this.statusBar.backgroundColorByHexString('#3f4751');
    });
  }

  onCancel(event:any) {
    this.logger.info(this, "onCancel");
    this.hideModal();
  }

  onSearch(event:any) {
    this.logger.info(this, "onSearch", event.target.value);
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
    let name = "";
    let url = `https://${this.domain}`;
    this.api.registerDeployment(name, url).then(
      (deployment:Deployment) => {
        this.database.saveDeployment(deployment).then((saved) => {
          loading.dismiss();
          this.loginDeployment(deployment);
        });
      },
      (error:any) => {
        let url = `http://${this.domain}`;
        this.api.registerDeployment(name, url).then(
          (deployment:Deployment) => {
            this.database.saveDeployment(deployment).then((saved) => {
              loading.dismiss();
              this.loginDeployment(deployment);
            });
          },
          (error:any) => {
            loading.dismiss();
            this.showAlert("Problem Adding Deployment", "The deployment does not have the necessary configuration to be added into the app, please contact the deployer letting them know about the problem.");
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
      (tokens:any) => {
        this.logger.info(this, "loginDeployment", "Tokens", tokens);
        deployment.copyInto(tokens);
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
      },
      (error:any) => {
        this.logger.error(this, "loginDeployment", "Client", error);
        loading.dismiss();
        this.showAlert('Problem Logging In', error);
      });
  }

}
