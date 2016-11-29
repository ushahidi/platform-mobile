import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, TextInput, Button,
  LoadingController, ToastController, AlertController, ModalController } from 'ionic-angular';

import { ResponseAddPage } from '../response-add/response-add';
import { ResponseDetailsPage } from '../response-details/response-details';

import { ApiService } from '../../providers/api-service/api-service';

@Component({
  selector: 'page-response-list',
  templateUrl: 'response-list.html',
  entryComponents:[ ResponseAddPage, ResponseDetailsPage ]
})
export class ResponseListPage {

  token: string = null;
  deployment: any;
  responses: any;

  constructor(
    public platform:Platform,
    public api:ApiService,
    public navParams: NavParams,
    public navController:NavController,
    public toastController: ToastController,
    public alertController: AlertController,
    public modalController: ModalController,
    public loadingController:LoadingController) {

  }

  ionViewDidLoad() {
    console.log('Response List ionViewDidLoad');
  }

  ionViewWillEnter() {
    console.log("Response List ionViewWillEnter");
    this.token = this.navParams.get("token");
    this.deployment = this.navParams.get("deployment");
    this.deployment.url = `https://${this.deployment.subdomain}.${this.deployment.domain}`;
    this.loadUpdates(null);
  }

  ionViewDidEnter() {
    console.log("Response List ionViewDidEnter");
  }

  loadUpdates(event) {
    console.log("Response List loadUpdates");
    this.api.getPosts(this.deployment.url, this.token).then(results => {
      let responses = <any[]>results['results'];
      console.log(`Response List Responses ${responses.length}`)
      this.responses = responses;
      if (event) {
        event.complete();
      }
    });
  }

  showResponse(event, response) {
    console.log("Deployment List showResponse");
    this.navController.push(
      ResponseDetailsPage,
      { token: this.token,
        deployment: this.deployment,
        response: response });
  }

  addResponse(event) {
    console.log("Deployment List addResponse");
    let modal = this.modalController.create(
      ResponseAddPage,
      { token: this.token,
        deployment: this.deployment });
    modal.present();
    modal.onDidDismiss(data => {

    });
  }

}
