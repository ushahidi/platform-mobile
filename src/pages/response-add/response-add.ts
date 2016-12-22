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
    for (let index in this.attributes) {
      let attribute = this.attributes[index];
      if (attribute.input == 'location') {
        let validator: any = null;
        if (attribute.required == "true") {
          validator = Validators.required;
        }
        let formGroup = new FormGroup({
          lat: new FormControl(''),
          lon: new FormControl('')}, validator);
        this.formGroup.addControl(attribute.key, formGroup);
      }
      else if (attribute.input == 'checkbox' || attribute.input == 'checkboxes') {
        let validator : any = null;
        if (attribute.required == "true") {
          validator = Validators.required;
        }
        let formGroup = new FormGroup({}, validator);
        let options = attribute.options.split(',');
        for (let index in options) {
          formGroup.addControl(options[index], new FormControl(''));
        }
        this.formGroup.addControl(attribute.key, formGroup);
      }
      else {
        let validators = [];
        if (attribute.required == "true") {
          validators.push(Validators.required);
        }
        this.formGroup.addControl(attribute.key, new FormControl('', validators));
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
    // let modal = this.modalController.create(
    //   ResponseMapPage,
    //   { latitude: event['latitude'],
    //     longitude: event['longitude'] },
    //   { showBackdrop: false,
    //     enableBackdropDismiss: false });
    // modal.onDidDismiss(data => {
    //   console.log(`Response Add Modal ${JSON.stringify(data)}`);
    // });
    // modal.present();
  }

  onCancel(event) {
    console.log("Response Add onCancel");
    this.viewController.dismiss();
  }

  postResponse(event:any=null) {
    console.log("Response Add postResponse");
    if (this.formGroup.valid) {
      let host = this.deployment.url;
      let token = this.token;
      let title = this.getTitle(this.formGroup.value);
      let description = this.getDescription(this.formGroup.value);
      let values = this.sanitizeValues(this.formGroup.value);
      let loading = this.showLoading("Posting...");
      this.api.createPost(host, token, this.form.id, title, description, values).then(
        (resp) => {
          console.log(`Response Add ${JSON.stringify(resp)}`);
          loading.dismiss();
          if (resp) {
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
          else {
            this.showAlert('Post Failed', 'There was a problem posting your response.');
          }
        },
        (error) => {
          console.error(`Response Add ${error}`);
          loading.dismiss();
          this.showAlert('Post Failed', error);
        });
    }
    else {
      this.showAlert('Required Fields Missing', 'Please ensure all required fields are entered and try again.');
    }
  }

  getTitle(values:any) {
    for (let index in this.attributes) {
      let attribute = this.attributes[index];
      if (attribute.type == 'title') {
        return values[attribute.key];
      }
    }
    return null;
  }

  getDescription(values:any) {
    for (let index in this.attributes) {
      let attribute = this.attributes[index];
      if (attribute.type == 'description') {
        return values[attribute.key];
      }
    }
    return null;
  }

  sanitizeValues(values:any) {
    console.log(`Response Add Values ${JSON.stringify(values)}`);
    let sanitized = {};
    for (let index in this.attributes) {
      let attribute = this.attributes[index];
      let key = attribute.key;
      let value = values[key];
      console.log(`Response Add Value ${attribute.label} ${attribute.input} ${key} ${value}`);
      if (attribute.input == 'checkbox' || attribute.input == 'checkboxes') {
        let checks = [];
        for (let key in value) {
          if (value[key] == true || value[key] == 1) {
            checks.push(key);
          }
        }
        sanitized[key] = checks;
      }
      else if (attribute.input == 'date') {
        if (value && value.length > 0) {
          sanitized[key] = [value];
        }
        else {
          sanitized[key] = [];
        }
      }
      else if (attribute.input == 'datetime') {
        if (value && value.length > 0) {
          sanitized[key] = [value];
        }
        else {
          sanitized[key] = [];
        }
      }
      else if (attribute.input == 'location') {
        sanitized[key] = [value];
      }
      else if (attribute.input == 'number') {
        if (value && value.length > 0) {
          sanitized[key] = [Number(value)];
        }
        else {
          sanitized[key] = [];
        }
      }
      else if (attribute.input == 'radio') {
        if (value && value.length > 0) {
          sanitized[key] = [value];
        }
        else {
          sanitized[key] = [];
        }
      }
      else if (attribute.input == 'select') {
        if (value && value.length > 0) {
          sanitized[key] = [value];
        }
        else {
          sanitized[key] = [];
        }
      }
      else if (attribute.input == 'text') {
        sanitized[key] = [value];
      }
      else if (attribute.input == 'textarea') {
        sanitized[key] = [value];
      }
      else if (attribute.input == 'upload') {
        //TODO handle image upload
      }
      else if (attribute.input == 'varchar') {
        sanitized[key] = [value];
      }
      else if (attribute.input == 'video') {
        //TODO handle video upload
      }
    }
    console.log(`Response Add Sanitized ${JSON.stringify(sanitized)}`);
    return sanitized;
  }

  showLoading(message) {
    let loading = this.loadingController.create({
      content: message
    });
    loading.present();
    return loading;
  }

  showAlert(title, subTitle) {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: ['OK']
    });
    alert.present();
    return alert;
  }

  showToast(message, duration:number=1500) {
    let toast = this.toastController.create({
      message: message,
      duration: duration
    });
    toast.present();
    return toast;
  }

}
