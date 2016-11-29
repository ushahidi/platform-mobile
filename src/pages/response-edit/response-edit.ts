import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, TextInput, Button,
        LoadingController, ToastController, AlertController, ViewController } from 'ionic-angular';

import { ApiService } from '../../providers/api-service/api-service';

@Component({
  selector: 'page-response-edit',
  templateUrl: 'response-edit.html',
  providers: [ ApiService ]
})
export class ResponseEditPage {

  token: string = null;
  deployment: any;
  response: any;

  @ViewChild('title') title: TextInput;
  @ViewChild('content') content: TextInput;

  constructor(
    public platform:Platform,
    public api:ApiService,
    public navParams: NavParams,
    public navController:NavController,
    public toastController: ToastController,
    public alertController: AlertController,
    public viewController: ViewController,
    public loadingController:LoadingController) {}

  ionViewDidLoad() {
    console.log('Response Edit ionViewDidLoad');
  }

  ionViewWillEnter() {
    console.log("Response Edit ionViewWillEnter");
    this.token = this.navParams.get("token");
    this.deployment = this.navParams.get("deployment");
    this.deployment.url = `https://${this.deployment.subdomain}.${this.deployment.domain}`;
    this.response = this.navParams.get("response");
  }

  ionViewDidEnter() {
    console.log("Response Edit ionViewDidEnter");
  }

  doCancel(event) {
    console.log("Response Edit doCancel");
    this.viewController.dismiss();
  }

  updateResponse(event) {
    console.log("Response Edit updateResponse");
    let host = this.deployment.url;
    let token = this.token;
    let id = this.response.id;
    let title = this.title.value.toString();
    let content = this.content.value.toString();
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
    let toast = this.toastController.create({
      message: 'Update Successful',
      duration: 3000
    });
    toast.present();
    this.viewController.dismiss();
  }

}
