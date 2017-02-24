import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, NavParams, Searchbar, Content,
  NavController, ViewController, ModalController, LoadingController, ToastController, AlertController, ActionSheetController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { DeploymentLoginPage } from '../deployment-login/deployment-login';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';

import { Deployment } from '../../models/deployment';

@Component({
  selector: 'deployment-add-page',
  templateUrl: 'deployment-add.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ DeploymentLoginPage ]
})
export class DeploymentAddPage extends BasePage {

  loading: boolean = false;
  deployments: Deployment[] = [];

  @ViewChild(Content)
  content: Content;
  
  @ViewChild('searchbar')
  searchbar: Searchbar;

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

  ionViewDidLoad() {
    super.ionViewDidLoad();
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.platform.ready().then(() => {
      StatusBar.styleLightContent();
      StatusBar.backgroundColorByHexString('#3f4751');
    });
  }

  onCancel(event:any) {
    this.logger.info(this, "onCancel");
    this.hideModal();
  }

  onSearch(event:any) {
    this.logger.info(this, "onSearch", event.target.value);
    let search = event.target.value;
    if (search && search.length > 0) {
      this.loading = true;
      this.api.searchDeployments(search).then(
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
      this.deployments = [];
    }
  }

  addDeployment(event:any, deployment:Deployment) {
    this.logger.info(this, "addDeployment");
    let loading = this.showLoading("Adding...");
    let where = { subdomain: deployment.subdomain };
    this.database.getDeployments(where).then(
      (deployments:Deployment[]) => {
        if (deployments && deployments.length > 0) {
          loading.dismiss();
          this.showAlert('Deployment Already Added', 'Looks like that deployment has already been added.');
        }
        else {
          this.database.saveDeployment(deployment).then(
            (id:number) => {
              this.logger.info(this, "addDeployment", "ID", id);
              loading.dismiss();
              if (id) {
                deployment.id = id;
                this.hideModal({ deployment : deployment });
              }
              else {
                this.showAlert('Problem Adding Deployment', 'There was a problem adding your deployment.');
              }
            },
            (error:any) => {
              this.logger.error(this, "addDeployment", error);
              loading.dismiss();
              this.showAlert('Problem Adding Deployment', error);
            });
        }
      });
  }

}
