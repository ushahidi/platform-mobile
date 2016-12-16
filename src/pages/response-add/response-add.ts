import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, Button,
        LoadingController, ToastController, AlertController, ViewController, ModalController } from 'ionic-angular';

import { ApiService } from '../../providers/api-service';

import { ResponseMapPage } from '../response-map/response-map';

import { CheckboxComponent } from '../../components/checkbox/checkbox';
import { CheckboxesComponent } from '../../components/checkboxes/checkboxes';
import { DateComponent } from '../../components/date/date';
import { DateTimeComponent } from '../../components/datetime/datetime';
import { ImageComponent } from '../../components/image/image';
import { LocationComponent } from '../../components/location/location';
import { NumberComponent } from '../../components/number/number';
import { RadioComponent } from '../../components/radio/radio';
import { SelectComponent } from '../../components/select/select';
import { TextComponent } from '../../components/text/text';
import { TextAreaComponent } from '../../components/textarea/textarea';
import { VideoComponent } from '../../components/video/video';

@Component({
  selector: 'page-response-add',
  templateUrl: 'response-add.html',
  providers: [ ApiService ]
})
export class ResponseAddPage {

  color: string = "#cccccc";
  token: string = null;
  deployment: any;
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
    console.log('Response Add ionViewDidLoad');
  }

  ionViewWillEnter() {
    console.log("Response Add ionViewWillEnter");
    this.token = this.navParams.get("token");
    this.deployment = this.navParams.get("deployment");
    this.form = this.navParams.get("form");
    this.color = this.form.color;
  }

  ionViewDidEnter() {
    console.log("Response Add ionViewDidEnter");
  }

  changeLocation(event) {
    console.log("Response Add changeLocation");
    let modal = this.modalController.create(
      ResponseMapPage,
      { latitude: event['latitude'],
        longitude: event['longitude'] });
    modal.onDidDismiss(data => {
      console.log(`Modal ${JSON.stringify(data)}`);
    });
    modal.present();
  }

  doCancel(event) {
    console.log("Response Add doCancel");
    this.viewController.dismiss();
  }

  postResponse(event) {
    console.log("Response Add postResponse");
    let host = this.deployment.url;
    let token = this.token;
    let title = "";
    let content = "";
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
      subTitle: 'There was a problem posting your response.',
      buttons: ['OK']
    });
    alert.present();
  }

  postResponseSucceeded() {
    let alert = this.alertController.create({
      title: 'Post Successful',
      subTitle: 'Your response has been posted!',
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
