import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, TextInput, Button,
  LoadingController, ToastController, AlertController, ModalController } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { ResponseListPage } from '../response-list/response-list';

import { ApiService } from '../../providers/api-service/api-service';

@Component({
  selector: 'page-deployment-details',
  templateUrl: 'deployment-details.html',
  providers: [ ApiService ],
  entryComponents:[ LoginPage, ResponseListPage ]
})
export class DeploymentDetailsPage {

  token: String = null;
  deployment: any;

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
      this.deployment = this.navParams.get("deployment");
      this.deployment.url = `https://${this.deployment.subdomain}.${this.deployment.domain}`;
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

    showCollections(event) {
        console.log("Deployment Details showCollections");
    }

    loginDeployment(event) {
      console.log("Deployment Details loginDeployment");
      let modal = this.modalController.create(
        LoginPage,
        { deployment: this.deployment });
      modal.present();
      modal.onDidDismiss(data => {
        console.log(`Deployment Details Data ${JSON.stringify(data)}`);
        this.token = data['token'];
      });
    }
}
