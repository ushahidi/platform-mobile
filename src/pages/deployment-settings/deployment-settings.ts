import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, NavParams, TextInput, Content,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController } from 'ionic-angular';

import { Deployment } from '../../models/deployment';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';

@Component({
  selector: 'deployment-settings-page',
  templateUrl: 'deployment-settings.html'
})
export class DeploymentSettingsPage extends BasePage {

  deployment: Deployment = null;

  @ViewChild(Content)
  content: Content;

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
      super(zone, platform, logger, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
    }

    ionViewDidLoad() {
      super.ionViewDidLoad();
    }

    ionViewWillEnter() {
      super.ionViewWillEnter();
      this.deployment = this.getParameter<Deployment>("deployment");
    }

    onCancel(event:any) {
      this.logger.info(this, 'onCancel');
      this.hideModal();
    }

    onDone(event:any) {
      this.logger.info(this, 'onDone');
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
              this.hideModal();
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
