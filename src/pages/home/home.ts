import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, NavParams, Content,
  NavController, ViewController, ModalController, LoadingController, ToastController, AlertController, ActionSheetController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { Deployment } from '../../models/deployment';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';
import { DeploymentAddPage } from '../../pages/deployment-add/deployment-add';
import { DeploymentDetailsPage } from '../../pages/deployment-details/deployment-details';

@Component({
  selector: 'home-page',
  templateUrl: 'home.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ DeploymentAddPage, DeploymentDetailsPage ]
})
export class HomePage extends BasePage {

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

  @ViewChild(Content)
  content: Content;

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.platform.ready().then(() => {
      StatusBar.styleDefault();
      StatusBar.backgroundColorByHexString('#f9f9f8');
    });
  }

  addDeployment(event:any) {
    this.logger.info(this, "addDeployment");
    let modal = this.showModal(DeploymentAddPage, {});
    modal.onDidDismiss((data:any) => {
      StatusBar.styleDefault();
      StatusBar.backgroundColorByHexString('#f9f9f8');
      if (data) {
        this.logger.info(this, "addDeployment", data);
        let deployment:Deployment = data.deployment;
        this.showDeployment(deployment);
      }
    });
  }

  showDeployment(deployment:Deployment) {
    this.logger.info(this, "showDeployment", deployment);
    this.showRootPage(DeploymentDetailsPage,
      { deployment: deployment },
      { animate: true,
        direction: 'forward' });
  }

}
