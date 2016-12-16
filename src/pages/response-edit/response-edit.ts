import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, TextInput, Button,
        LoadingController, ToastController, AlertController, ViewController, ModalController } from 'ionic-angular';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

import { ResponseMapPage } from '../response-map/response-map';

@Component({
  selector: 'page-response-edit',
  templateUrl: 'response-edit.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ ResponseMapPage ]
})
export class ResponseEditPage {

  color: string = "#cccccc";
  token: string = null;
  deployment: any;
  form: any;
  attributes: any;
  response:any = null;

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
    console.log('Response Edit ionViewDidLoad');
  }

  ionViewWillEnter() {
    console.log("Response Edit ionViewWillEnter");
    this.token = this.navParams.get("token");
    this.deployment = this.navParams.get("deployment");
    this.response = this.navParams.get("response");
    this.form = this.navParams.get("form");
    this.attributes = this.navParams.get("attributes");
    this.color = this.form.color;
  }

  ionViewDidEnter() {
    console.log("Response Edit ionViewDidEnter");
  }

  onCancel(event) {
    console.log("Response Edit onCancel");
    this.viewController.dismiss();
  }

  changeLocation(event) {
    console.log(`Response Add changeLocation ${JSON.stringify(event)}`);
    let modal = this.modalController.create(
      ResponseMapPage,
      { latitude: event['latitude'],
        longitude: event['longitude'] },
      { showBackdrop: false,
        enableBackdropDismiss: false });
    modal.onDidDismiss(data => {
      console.log(`Response Add Modal ${JSON.stringify(data)}`);
    });
    modal.present();
  }

  updateResponse(event) {
    console.log("Response Edit updateResponse");
    let host = this.deployment.url;
    let token = this.token;
    let id = this.response.id;
    let title = "";
    let content = "";
    let loading = this.loadingController.create({
      content: "Updating..."
    });
    loading.present();
    this.api.updatePost(host, token, id, title, content).then(resp => {
      console.log(`Response Edit ${resp}`);
      loading.dismiss();
      if (resp) {
        this.updateResponseSucceeded();
      }
      else {
        this.updateResponseFailed();
      }
    });
  }

  updateResponseFailed() {
    let alert = this.alertController.create({
      title: 'Update Failed',
      subTitle: 'There was a problem updating the response.',
      buttons: ['OK']
    });
    alert.present();
  }

  updateResponseSucceeded() {
    let alert = this.alertController.create({
      title: 'Update Successful',
      subTitle: 'Your response has been updated!',
      buttons: [{
        text: 'Ok',
        role: 'cancel',
        handler: () => {
          this.viewController.dismiss();
        }
      }]
    });
    alert.present();
  }

}
