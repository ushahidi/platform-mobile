import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, Button, LoadingController,
  ToastController, AlertController, ViewController, ModalController } from 'ionic-angular';

import { ResponseEditPage } from '../response-edit/response-edit';

import { ApiService } from '../../providers/api-service';

@Component({
  selector: 'page-response-details',
  templateUrl: 'response-details.html',
  providers: [ ApiService ],
  entryComponents:[ ResponseEditPage ]
})
export class ResponseDetailsPage {

  token: string = null;
  deployment: any;
  response: any;
  form: any;

  @ViewChild('submit') submit: Button;

  constructor(
    public platform:Platform,
    public api:ApiService,
    public navParams: NavParams,
    public navController:NavController,
    public toastController: ToastController,
    public alertController: AlertController,
    public viewController: ViewController,
    public modalController: ModalController,
    public loadingController:LoadingController) {

  }

  ionViewDidLoad() {
    console.log('Response Details ionViewDidLoad');
  }

  ionViewWillEnter() {
    console.log("Response Details ionViewWillEnter");
    this.token = this.navParams.get("token");
    this.deployment = this.navParams.get("deployment");
    this.response = this.navParams.get("response");
    this.form = this.navParams.get("form");
  }

  ionViewDidEnter() {
    console.log("Response Details ionViewDidEnter");
  }

  editResponse(event) {
    console.log("Response Details editResponse");
    let modal = this.modalController.create(
      ResponseEditPage,
      { token: this.token,
        deployment: this.deployment,
        form: this.form,
        response: this.response });
    modal.present();
    modal.onDidDismiss(data => {

    });
  }

}
