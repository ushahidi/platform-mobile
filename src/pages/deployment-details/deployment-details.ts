import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, TextInput, Button, LoadingController, ToastController, AlertController } from 'ionic-angular';

import { ApiService } from '../../providers/api-service/api-service';

@Component({
  selector: 'page-deployment-details',
  templateUrl: 'deployment-details.html',
  providers: [ ApiService ]
})
export class DeploymentDetailsPage {

  deployment: any;

  constructor(
    public platform:Platform,
    public api:ApiService,
    public navParams: NavParams,
    public navController:NavController,
    public toastController: ToastController,
    public alertController: AlertController,
    public loadingController:LoadingController) {}

    ionViewDidLoad() {
      console.log('Deployment Details ionViewDidLoad');
    }

    ionViewWillEnter() {
      console.log("Deployment Details ionViewWillEnter");
      this.deployment = this.navParams.get("deployment");
    }

    ionViewDidEnter() {
      console.log("Deployment Details ionViewDidEnter");
    }

}
