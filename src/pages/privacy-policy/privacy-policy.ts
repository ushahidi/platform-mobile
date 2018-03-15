import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, Content, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Deployment } from '../../models/deployment';
import { Login } from '../../models/login';

import { BasePage } from '../../pages/base-page/base-page';
import { DeploymentNonePage } from '../../pages/deployment-none/deployment-none';
import { DeploymentDetailsPage } from '../../pages/deployment-details/deployment-details';
import { WhitelabelIntroPage } from '../../pages/whitelabel-intro/whitelabel-intro';

import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';
import { SettingsService } from '../../providers/settings-service';

@Component({
  selector: 'page-privacy-policy',
  templateUrl: 'privacy-policy.html',
  providers: [ LoggerService,DatabaseService ],
  entryComponents:[ DeploymentNonePage, DeploymentDetailsPage, WhitelabelIntroPage ]
})
export class PrivacyPolicyPage extends BasePage {

  @ViewChild(Content)
  content:Content;

  acceptedTerms:boolean = false;
  privacyPolicy:string = "https://www.ushahidi.com/privacy-policy";
  termsOfService:string = "https://www.ushahidi.com/terms-of-service";

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
  }

  private loadWhitelabel():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.settings.getDeploymentUrl().then((url:string) => {
        let whitelabel = (url && url.length > 0);
        this.logger.info(this, 'loadWhitelabel', "Whitelabel", whitelabel);
        resolve(whitelabel);
      },
      (error:any) => {
        this.logger.info(this, 'loadWhitelabel', "Whitelabel", "No");
        resolve(false);
      });
    });
  }

  private loadDeployment():Promise<Deployment> {
    return new Promise((resolve, reject) => {
      this.database.getDeployments().then(
        (deployments:Deployment[]) => {
          if (deployments.length > 0) {
            this.logger.info(this, "loadDeployment", deployments.length);
            resolve(deployments[0]);
          }
          else {
            this.logger.info(this, "loadDeployment", "None");
            resolve(null);
          }
        },
        (error:any) => {
          this.logger.error(this, "loadDeployment", error);
          resolve(null);
        });
    });
  }

  protected showNext(event:any=null) {
    this.logger.info(this, "showNext", this.acceptedTerms)
    this.settings.setAcceptedTerms(this.acceptedTerms).then((saved:boolean) => {
      this.logger.info(this, "showNext", "Accepted Terms", this.acceptedTerms, "Saved", saved);
      if (saved) {
        this.loadWhitelabel().then((whitelabel:boolean) => {
          if (whitelabel) {
            this.showRootPage(WhitelabelIntroPage,
              { },
              { animate: true,
                direction: 'forward' });
          }
          else {
            this.loadDeployment().then((deployment:Deployment) => {
              if (deployment != null) {
                this.showRootPage(DeploymentDetailsPage,
                  { deployment: deployment },
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
        });
      }
      else {
        this.language.getTranslations([
          'SETTINGS_SAVE_FAILURE',
          'SETTINGS_SAVE_FAILURE_DESCRIPTION']).then((translations:string[]) => {
          this.showAlert(translations[0], translations[1]);
        });
      }
    });
  }

}
