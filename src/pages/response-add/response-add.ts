import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, TextInput, Button,
        LoadingController, ToastController, AlertController, ViewController } from 'ionic-angular';

import { ApiService } from '../../providers/api-service/api-service';

@Component({
  selector: 'page-response-add',
  templateUrl: 'response-add.html',
  providers: [ ApiService ]
})
export class ResponseAddPage {

  token: string = null;
  deployment: any;

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
    public loadingController:LoadingController) {

  }

  ionViewDidLoad() {
    console.log('Response Add ionViewDidLoad');
  }

  ionViewWillEnter() {
    console.log("Response Add ionViewWillEnter");
    this.token = this.navParams.get("token");
    this.deployment = this.navParams.get("deployment");
    this.deployment.url = `https://${this.deployment.subdomain}.${this.deployment.domain}`;
  }

  ionViewDidEnter() {
    console.log("Response Add ionViewDidEnter");
  }

  doCancel(event) {
    console.log("Response Add doCancel");
    this.viewController.dismiss();
  }

  postResponse(event) {
    console.log("Response Add postResponse");
    let host = this.deployment.url;
    let token = this.token;
    let title = this.title.value.toString();
    let content = this.content.value.toString();
    let loading = this.loadingController.create({
      content: "Posting..."
    });
    loading.present();
    this.api.createPost(host, token, title, content).then(resp => {
      console.log(`Response Add ${resp}`);
      loading.dismiss();
      if (resp) {
        this.postResponseSucceeded();
      }
      else {
        this.postResponseFailed();
      }
    });
  }

  postResponseFailed() {
    let alert = this.alertController.create({
      title: 'Post Failed',
      subTitle: 'There was a problem posting the response.',
      buttons: ['OK']
    });
    alert.present();
  }

  postResponseSucceeded() {
    let toast = this.toastController.create({
      message: 'Post Successful',
      duration: 3000
    });
    toast.present();
    this.viewController.dismiss();
  }

}
