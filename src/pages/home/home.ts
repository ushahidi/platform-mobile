import { Component } from '@angular/core';
import { Platform, NavParams,
  NavController, ViewController, ModalController, LoadingController, ToastController, AlertController, ActionSheetController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';
import { DeploymentAddPage } from '../../pages/deployment-add/deployment-add';
import { DeploymentLoginPage } from '../../pages/deployment-login/deployment-login';

import { Deployment } from '../../models/deployment';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ DeploymentAddPage, DeploymentLoginPage ]
})
export class HomePage extends BasePage {

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

  ionViewLoaded() {
    this.logger.info(this, "ionViewLoaded");
  }

  ionViewWillEnter() {
    this.logger.info(this, "ionViewWillEnter");
    this.platform.ready().then(() => {
      StatusBar.styleDefault();
      StatusBar.backgroundColorByHexString('#f9f9f8');
    });
  }

  ionViewDidEnter() {
    this.logger.info(this, "ionViewDidEnter");
  }

  addDeployment(event) {
    this.logger.info(this, "addDeployment");
    let modal = this.showModal(DeploymentAddPage, {});
    modal.onDidDismiss(data => {
      StatusBar.styleDefault();
      StatusBar.backgroundColorByHexString('#f9f9f8');
      if (data) {
        console.log(data);
        this.showRootPage(DeploymentLoginPage,
          { deployment: data['deployment'] },
          { animate: true,
            direction: 'forward' });
      }
    });
  }

  showMenu(event) {
    this.logger.info(this, "showMenu");
  }
}
