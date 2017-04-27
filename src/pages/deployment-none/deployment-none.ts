import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, Content, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Deployment } from '../../models/deployment';

import { LoggerService } from '../../providers/logger-service';

import { BasePage } from '../../pages/base-page/base-page';
import { DeploymentSearchPage } from '../../pages/deployment-search/deployment-search';
import { DeploymentDetailsPage } from '../../pages/deployment-details/deployment-details';

@Component({
  selector: 'deployment-none',
  templateUrl: 'deployment-none.html',
  providers: [ LoggerService ],
  entryComponents:[ DeploymentSearchPage, DeploymentDetailsPage ]
})
export class DeploymentNonePage extends BasePage {

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
    protected logger:LoggerService) {
    super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, logger);
  }

  @ViewChild(Content)
  content: Content;

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.loadStatusBar(false);
  }

  showSearch() {
    this.logger.info(this, "showSearch");
    let modal = this.showModal(DeploymentSearchPage, {});
    modal.onDidDismiss((data:any) => {
      this.loadStatusBar(false);
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
