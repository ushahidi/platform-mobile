import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, TextInput, Button,
  LoadingController, ToastController, AlertController, ModalController } from 'ionic-angular';

import { ResponseListPage } from '../response-list/response-list';
import { ResponseAddPage } from '../response-add/response-add';

import { ApiService } from '../../providers/api-service/api-service';

@Component({
  selector: 'page-deployment-details',
  templateUrl: 'deployment-details.html',
  providers: [ ApiService ],
  entryComponents:[ ResponseListPage, ResponseAddPage ]
})
export class DeploymentDetailsPage {

  token: string = null;
  deployment: any;
  site: any;

  constructor(
    public platform:Platform,
    public api:ApiService,
    public navParams: NavParams,
    public navController:NavController,
    public toastController: ToastController,
    public alertController: AlertController,
    public modalController: ModalController,
    public loadingController:LoadingController) {}

    ionViewDidLoad() {
      console.log('Deployment Details ionViewDidLoad');
    }

    ionViewWillEnter() {
      console.log("Deployment Details ionViewWillEnter");
      this.token = this.navParams.get('token');
      this.deployment = this.navParams.get("deployment");
      this.deployment.url = `https://${this.deployment.subdomain}.${this.deployment.domain}`;
      if (this.token) {
        this.loadDeployment();
      }
    }

    ionViewDidEnter() {
      console.log(`Deployment Details ionViewDidEnter`);
    }

    showResponses(event) {
      console.log("Deployment Details showResponses");
      this.navController.push(
        ResponseListPage,
        { token: this.token,
          deployment: this.deployment });
    }

    loadDeployment() {
      this.api.getConfigSite(this.deployment.url, this.token).then(results => {
        console.log(`Site ${results}`);
        this.site = results;
      });
    }

    addResponse(event) {
      console.log("Deployment Details addResponse");
      let modal = this.modalController.create(
        ResponseAddPage,
        { token: this.token,
          deployment: this.deployment });
      modal.present();
      modal.onDidDismiss(data => {

      });
    }
}
