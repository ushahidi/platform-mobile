import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, TextInput, Button, NavParams,
  NavController, ViewController, ModalController, LoadingController, ToastController, AlertController, ActionSheetController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { BasePage } from '../../pages/base-page/base-page';
import { DeploymentDetailsPage } from '../../pages/deployment-details/deployment-details';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { Deployment } from '../../models/deployment';

@Component({
  selector: 'deployment-login-page',
  templateUrl: 'deployment-login.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ DeploymentDetailsPage ]
})
export class DeploymentLoginPage extends BasePage {

  deployment: Deployment = null;

  @ViewChild('login')
  login: Button;

  @ViewChild('username')
  username: TextInput;

  @ViewChild('password')
  password: TextInput;

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
      this.deployment = this.getParameter<Deployment>("deployment");
      if (this.deployment.username) {
        this.username.value = this.deployment.username;
      }
      else if (this.debug && this.deployment.subdomain == 'dale') {
        //TODO remove this later, hardcoded to speed up development
        this.username.value = "dalezak@gmail.com";
      }
      if (this.deployment.password) {
        this.password.value = this.deployment.password;
      }
      else if (this.debug && this.deployment.subdomain == 'dale') {
        //TODO remove this later, hardcoded to speed up development
        this.password.value = "P4NpCNUqLTCnvJAQBBMX";
      }
    }

    onCancel(event:any) {
      this.logger.info(this, "onCancel");
      this.hideModal();
    }

    onLogin(event:any) {
      this.logger.info(this, "onLogin");
      let username = this.username.value.toString();
      let password = this.password.value.toString();
      if (username.length > 0 && password.length > 0) {
        let loading = this.showLoading("Logging in...");
        this.api.authLogin(this.deployment, username, password).then(
          (tokens:any) => {
            this.logger.info(this, "onLogin", "Tokens", tokens);
            if (tokens != null) {
              this.deployment.copyInto(tokens);
              this.database.saveDeployment(this.deployment).then(
                (saved:any) => {
                  loading.dismiss();
                  this.showToast('Login Successful');
                  this.showDeployment(this.deployment);
                },
                (error:any) => {
                  loading.dismiss();
                  this.showAlert('Problem Updating Deployment', error);
                });
            }
            else {
              loading.dismiss();
              this.showAlert('Invalid Credentials', 'Please verify your email and password, then try again.');
            }
          },
          (error:any) => {
            loading.dismiss();
            this.showAlert('Invalid Credentials', 'Please verify your email and password, then try again.');
          });
      }
    }

    showDeployment(deployment:Deployment) {
      this.showRootPage(DeploymentDetailsPage,
        { deployment: deployment },
        { animate: true,
          direction: 'forward' });
    }

    showMenu(event:any) {
      this.logger.info(this, "showMenu");
    }

}
