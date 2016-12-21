import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, Button, LoadingController,
  ToastController, AlertController, ViewController, ModalController } from 'ionic-angular';

import { ResponseEditPage } from '../response-edit/response-edit';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

@Component({
  selector: 'page-response-details',
  templateUrl: 'response-details.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ ResponseEditPage ]
})
export class ResponseDetailsPage {

  color: string = "#cccccc";
  token: string = null;
  deployment: any;
  response: any;
  form: any;
  values: any;

  @ViewChild('submit') submit: Button;

  constructor(
    public platform:Platform,
    public api:ApiService,
    public database:DatabaseService,
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
    this.color = this.form.color;
  }

  ionViewDidEnter() {
    console.log("Response Details ionViewDidEnter");
  }

  shareResponse(event) {
    console.log("Response Details shareResponse");
    let toast = this.toastController.create({
      message: 'Sharing Not Implemented',
      duration: 1500
    });
    toast.present();
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
      console.log("Response Details editResponse Done");
    });
  }

}
