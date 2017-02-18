import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, NavParams, Button, TextInput,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { Deployment } from '../../models/deployment';

@Component({
  selector: 'page-deployment-settings',
  templateUrl: 'deployment-settings.html'
})
export class DeploymentSettingsPage extends BasePage {

  deployment: Deployment = null;

  @ViewChild('save')
  save: Button;

  @ViewChild('name')
  name: TextInput;

  @ViewChild('description')
  description: TextInput;

  @ViewChild('email')
  email: TextInput;

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
      super(zone, platform, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
    }

    ionViewDidLoad() {
      super.ionViewDidLoad();
      this.logger.info(this, "ionViewDidLoad");
    }

    ionViewWillEnter() {
      super.ionViewWillEnter();
      this.logger.info(this, "ionViewWillEnter");
      this.deployment = this.navParams.get("deployment");
    }

    saveSettings(event) {
      this.logger.info(this, "saveSettings");
      let loading = this.showLoading("Saving...");
      let changes = {
        name: this.deployment.name,
        email: this.deployment.email,
        description: this.deployment.description };
      this.api.updateDeployment(this.deployment, changes).then(
        (updated:any) => {
          this.deployment.copyInto(changes);
          this.database.saveDeployment(this.deployment).then(
            (saved:any) => {
              loading.dismiss();
              this.showToast('Settings Saved');
            },
            (error:any) => {
              loading.dismiss();
              this.showAlert('Problem Saving Settings', error);
            });
        },
        (error:any) => {
          loading.dismiss();
          this.showAlert('Problem Saving Settings', error);
      });
    }

}
