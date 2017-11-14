import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, Content, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Deployment } from '../../models/deployment';
import { Login } from '../../models/login';

import { BasePage } from '../../pages/base-page/base-page';
import { DeploymentDetailsPage } from '../../pages/deployment-details/deployment-details';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';
import { SettingsService } from '../../providers/settings-service';

@Component({
  selector: 'whitelabel-intro',
  templateUrl: 'whitelabel-intro.html',
  providers: [ LoggerService,DatabaseService, ApiService ],
  entryComponents:[ DeploymentDetailsPage ]
})
export class WhitelabelIntroPage extends BasePage {

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
    protected api:ApiService,
    protected logger:LoggerService,
    protected database:DatabaseService,
    protected settings:SettingsService) {
    super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, logger);
  }

  name:string = null;
  email:string = null;
  loading:boolean = false;
  deployment:Deployment = null;

  @ViewChild(Content)
  content: Content;

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.loadStatusBar(false, true);
    this.loadAppName();
    this.loadDeployment();
  }

  loadAppName() {
    this.logger.info(this, "loadAppName");
    this.settings.getAppName().then((name:string) => {
      this.name = name;
    });
    this.settings.getDeploymentEmail().then((email:string) => {
      this.email = email;
    });
  }

  loadDeployment() {
    this.logger.info(this, "loadDeployment");
    this.loading = true;
    this.settings.getDeploymentUrl().then((url:string) => {
      this.logger.info(this, "loadDeployment", "URL", url);
      this.api.registerDeployment(url).then((deployment:Deployment) => {
        this.logger.info(this, "loadDeployment", "Deployment", deployment);
        this.api.clientLogin(deployment).then(
          (login:Login) => {
            this.logger.info(this, "loadDeployment", "Login", login);
            deployment.copyInto(login);
            this.api.getDeployment(deployment, false).then((details:Deployment) => {
              deployment.copyInto(details);
              this.database.saveDeployment(deployment).then(
                (id:number) => {
                  this.deployment = deployment
                  this.deployment.id = id;
                  this.loading = false;
                  this.showDeployment();
                },
                (error:any) => {
                  this.deployment = null;
                  this.loading = false;
                });
            });
          },
          (error:any) => {
            this.deployment = null;
            this.loading = false;
          });
      },
      (error:any) => {
        this.deployment = null;
        this.loading = false;
      });
    },
    (error:any) => {
      this.deployment = null;
      this.loading = false;
    });
  }

  showDeployment() {
    this.logger.info(this, "showDeployment", this.deployment);
    this.showRootPage(DeploymentDetailsPage,
      { deployment: this.deployment },
      { animate: true,
        direction: 'forward' });
  }

}
