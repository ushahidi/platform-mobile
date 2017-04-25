import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, NavParams, Content,
  NavController, ViewController, ModalController, LoadingController, ToastController, AlertController, ActionSheetController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';

import { Deployment } from '../../models/deployment';

import { LoggerService } from '../../providers/logger-service';

import { BasePage } from '../../pages/base-page/base-page';
import { DeploymentSearchPage } from '../../pages/deployment-search/deployment-search';
import { DeploymentDetailsPage } from '../../pages/deployment-details/deployment-details';

@Component({
  selector: 'home-page',
  templateUrl: 'home.html',
  providers: [ LoggerService ],
  entryComponents:[ DeploymentSearchPage, DeploymentDetailsPage ]
})
export class HomePage extends BasePage {

  constructor(
    public statusBar:StatusBar,
    public logger:LoggerService,
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
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString('#f9f9f8');
    });
  }

  showSearch() {
    this.logger.info(this, "showSearch");
    let modal = this.showModal(DeploymentSearchPage, {});
    modal.onDidDismiss((data:any) => {
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString('#f9f9f8');
      if (data) {
        this.logger.info(this, "showSearch", data);
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
