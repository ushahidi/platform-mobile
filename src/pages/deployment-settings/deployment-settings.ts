import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, TextInput, Content, Events, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Deployment } from '../../models/deployment';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';

import { DEPLOYMENT_UPDATED } from '../../constants/events';

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
    protected api:ApiService,
    protected database:DatabaseService,
    protected events:Events) {
    super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, logger);
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
            this.events.publish(DEPLOYMENT_UPDATED, this.deployment.id);
            this.trackEvent("Deployments", "updated", this.deployment.website);
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
