import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, Content, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Deployment } from '../../models/deployment';
import { Login } from '../../models/login';

import { BasePage } from '../../pages/base-page/base-page';
import { DeploymentNonePage } from '../../pages/deployment-none/deployment-none';
import { DeploymentDetailsPage } from '../../pages/deployment-details/deployment-details';

import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';
import { SettingsService } from '../../providers/settings-service';

@Component({
  selector: 'page-privacy-policy',
  templateUrl: 'privacy-policy.html',
  providers: [ LoggerService,DatabaseService ],
  entryComponents:[ DeploymentNonePage, DeploymentDetailsPage ]
})
export class PrivacyPolicyPage extends BasePage {

  acceptedTerms:boolean = false;
  privacyPolicy:string = "https://www.ushahidi.com/privacy-policy";
  termsOfService:string = "https://www.ushahidi.com/terms-of-service";

  deployment:Deployment = null;

  @ViewChild(Content)
  content: Content;

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
    protected database:DatabaseService,
    protected settings:SettingsService) {
    super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, logger);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.loadStatusBar(false, true);
    this.loadDeployment();
  }

  loadDeployment():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadDeployment");
      this.database.getDeployments().then(
        (deployments:Deployment[]) => {
          this.logger.info(this, "loadDeployment", deployments);
          if (deployments.length > 0) {
            this.deployment = deployments[0];
            resolve(true);
          }
          else {
            this.deployment = null;
            resolve(false);
          }
        },
        (error:any) => {
          this.logger.error(this, "loadDeployment", error);
          this.deployment = null;
          reject(error);
        });
    });
  }

  showNext(event:any=null) {
    this.logger.info(this, "showNext", this.acceptedTerms)
    this.settings.setAcceptedTerms(this.acceptedTerms).then(saved => {
      if (this.deployment) {
        this.showRootPage(DeploymentDetailsPage,
          { deployment: this.deployment },
          { animate: true,
            direction: 'forward' });
      }
      else {
        this.showRootPage(DeploymentNonePage,
          { },
          { animate: true,
            direction: 'forward' });
      }
    });
  }

}
