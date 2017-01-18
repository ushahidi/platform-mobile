import { Component } from '@angular/core';
import { Platform, NavParams,
  NavController, ViewController, ModalController, LoadingController, ToastController, AlertController, ActionSheetController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { DeploymentLoginPage } from '../deployment-login/deployment-login';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';

import { Deployment } from '../../models/deployment';

@Component({
  selector: 'page-deployment-add',
  templateUrl: 'deployment-add.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ DeploymentLoginPage ]
})
export class DeploymentAddPage extends BasePage {

  deployments: Deployment[] = [];
  loading: boolean = false;

  constructor(
    public platform:Platform,
    public api:ApiService,
    public logger:LoggerService,
    public database:DatabaseService,
    public navParams: NavParams,
    public navController:NavController,
    public viewController:ViewController,
    public modalController:ModalController,
    public toastController:ToastController,
    public alertController:AlertController,
    public loadingController:LoadingController,
    public actionController:ActionSheetController) {
      super(navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    this.logger.info(this, 'ionViewDidLoad');
  }

  ionViewWillEnter() {
    this.logger.info(this, "ionViewWillEnter");
    this.platform.ready().then(() => {
      StatusBar.styleLightContent();
      StatusBar.backgroundColorByHexString('#3f4751');
    });
  }

  onCancel(event:any) {
    this.logger.info(this, "onCancel");
    this.hideModal();
  }

  searchDeployments(event:any) {
    this.logger.info(this, `searchDeployments ${event.target.value}`);
    let search = event.target.value;
    if (search && search.length > 0) {
      this.loading = true;
      this.api.searchDeployments(search).then(
        (results) => {
          this.deployments = <Deployment[]>results;
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.showToast(error);
        });
    }
    else {
      this.deployments = [];
    }
  }

  addDeployment(event:any, deployment:Deployment) {
    this.logger.info(this, "addDeployment");
    let loading = this.showLoading("Adding...");
    let where = { subdomain: deployment.subdomain };
    this.database.getDeployments(where).then(results => {
      let deployments = <Deployment[]>results;
      if (deployments && deployments.length > 0) {
        loading.dismiss();
        this.showAlert('Deployment Already Added', 'Looks like that deployment has already been added.');
      }
      else {
        this.database.saveDeployment(deployment).then(
          (results) => {
            this.logger.info(this, "addDeployment", "ID", results);
            loading.dismiss();
            if (results) {
              deployment.id = <number>results;
              this.hideModal({ deployment : deployment });
            }
            else {
              this.showAlert('Problem Adding Deployment', 'There was a problem adding your deployment.');
            }
          },
          (error) => {
            console.error(`Deployment Add addDeployment ${error}`);
            loading.dismiss();
            this.showAlert('Problem Adding Deployment', error);
          });
      }
    });
  }

}
