import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, Button,
        LoadingController, ToastController, AlertController, ViewController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormGroupName, FormControl, Validators } from '@angular/forms';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

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
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ ResponseMapPage ]
})
export class ResponseAddPage {

  color: string = "#cccccc";
  token: string = null;
  deployment: any;
  form: any;
  attributes: any;
  formGroup: FormGroup = null;

  constructor(
    public platform:Platform,
    public api:ApiService,
    public database:DatabaseService,
    public navParams: NavParams,
    public navController:NavController,
    public toastController:ToastController,
    public alertController:AlertController,
    public viewController:ViewController,
    public modalController:ModalController,
    public loadingController:LoadingController,
    public formBuilder: FormBuilder) {

  }

  ionViewDidLoad() {
    console.log('Response Add ionViewDidLoad');
    this.token = this.navParams.get("token");
    this.deployment = this.navParams.get("deployment");
    this.form = this.navParams.get("form");
    this.attributes = this.navParams.get("attributes");
    this.color = this.form.color;
    this.formGroup = new FormGroup({});
    for (let item in this.attributes) {
      let attribute = this.attributes[item];
      console.log(`Response Add Attribute ${attribute.label} ${attribute.input} ${attribute.key}`)
      if (attribute.input == 'location') {
        // this.formGroup.addControl(attribute.key, new FormGroup({
        //   lat: new FormControl(''),
        //   lon: new FormControl('')}));
        this.formGroup.addControl(attribute.key, new FormControl(''));
      }
      else {
        this.formGroup.addControl(attribute.key, new FormControl(''));
      }
    }
  }

  ionViewWillEnter() {
    console.log("Response Add ionViewWillEnter");
  }

  ionViewDidEnter() {
    console.log("Response Add ionViewDidEnter");
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

  onCancel(event) {
    console.log("Response Add onCancel");
    this.viewController.dismiss();
  }

  postResponse(event:any=null) {
    console.log("Response Add postResponse");
    console.log(`Response Add Form ${JSON.stringify(this.formGroup.value)}`);
    let host = this.deployment.url;
    let token = this.token;
    let title = "";
    let values = this.formGroup.value;
    for (let index in this.attributes) {
      let attribute = this.attributes[index];
      let key = attribute.key;
      let value = values[key];
      console.log(`${index} > ${key} = ${value}`);
      if (attribute.type == 'title') {
        title = value;
      }
      if (attribute.input == 'video') {
        if (value && value.length > 0) {
          values[key] = [value];
        }
        else {
          values[key] = [];
        }
      }
      else if (attribute.input == 'upload') {
        if (value && value.length > 0) {
          values[key] = [value];
        }
        else {
          values[key] = [];
        }
      }
      else if (attribute.input == 'location') {
        if (value && value.length > 0) {
          let location = value.split(",");
          values[key] = [{
            lat: location[0],
            lon: location[1]}];
        }
        else {
          values[key] = [];
        }
      }
      else if (attribute.input == 'select') {
        if (value && value.length > 0) {
          values[key] = [value];
        }
        else {
          values[key] = [];
        }
      }
      else if (attribute.input == 'radio') {
        if (value && value.length > 0) {
          values[key] = [value];
        }
        else {
          values[key] = [];
        }
      }
      else if (attribute.input == 'number') {
        if (value && value.length > 0) {
            values[key] = [Number(value)];
        }
        else {
          values[key] = [];
        }
      }
      else if (attribute.input == 'date') {
        if (value && value.length > 0) {
          values[key] = [value];
        }
        else {
          values[key] = [];
        }
      }
      else if (attribute.input == 'datetime') {
        if (value && value.length > 0) {
          values[key] = [value];
        }
        else {
          values[key] = [];
        }
      }
      else {
        values[key] = [value];
      }
    }
    let loading = this.loadingController.create({
      content: "Posting..."
    });
    loading.present();
    this.api.createPost(host, token, this.form.id, title, values).then(
      (resp) => {
        console.log(`Response Add ${resp}`);
        loading.dismiss();
        if (resp) {
          this.postResponseSucceeded();
        }
        else {
          this.postResponseFailed();
        }
      },
      (error) => {
        console.error(`Response Add ${error}`);
        loading.dismiss();
        this.postResponseFailed(error);
      });
  }

  postResponseFailed(message:string='There was a problem posting your response.') {
    let alert = this.alertController.create({
      title: 'Post Failed',
      subTitle: message,
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
