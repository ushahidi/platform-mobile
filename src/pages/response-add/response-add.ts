import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, Button,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController  } from 'ionic-angular';
import { FormBuilder, FormGroup, FormGroupName, FormControl, Validators } from '@angular/forms';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';
import { ResponseMapPage } from '../../pages/response-map/response-map';

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

import { Deployment } from '../../models/deployment';
import { Form } from '../../models/form';
import { Attribute } from '../../models/attribute';

@Component({
  selector: 'page-response-add',
  templateUrl: 'response-add.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ ResponseMapPage ]
})
export class ResponseAddPage extends BasePage {

  deployment: Deployment = null;
  form: Form = null;
  formGroup: FormGroup = null;
  color: string = "#cccccc";

  constructor(
    public platform:Platform,
    public api:ApiService,
    public logger:LoggerService,
    public database:DatabaseService,
    public navParams: NavParams,
    public navController:NavController,
    public viewController:ViewController,
    public modalController:ModalController,
    public toastController:ToastController,
    public alertController:AlertController,
    public loadingController:LoadingController,
    public actionController:ActionSheetController,
    public formBuilder: FormBuilder) {
      super(navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    this.logger.info(this, 'ionViewDidLoad');
    this.deployment = this.navParams.get("deployment");
    this.form = this.navParams.get("form");
    this.color = this.form.color;
    this.formGroup = new FormGroup({});
    for (let index in this.form.attributes) {
      let attribute:Attribute = this.form.attributes[index];
      if (attribute.input == 'location') {
        let validator: any = null;
        if (attribute.required) {
          validator = Validators.required;
        }
        let formGroup = new FormGroup({
          lat: new FormControl(''),
          lon: new FormControl('')}, validator);
        this.formGroup.addControl(attribute.key, formGroup);
      }
      else if (attribute.input == 'checkbox' || attribute.input == 'checkboxes') {
        let validator : any = null;
        if (attribute.required) {
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
        if (attribute.required) {
          validators.push(Validators.required);
        }
        this.formGroup.addControl(attribute.key, new FormControl('', validators));
      }
    }
  }

  ionViewWillEnter() {
    this.logger.info(this, "ionViewWillEnter");
  }

  ionViewDidEnter() {
    this.logger.info(this, "ionViewDidEnter");
  }

  changeLocation(event) {
    this.logger.info(this, "changeLocation", event);
    let modal = this.showModal(ResponseMapPage,
      { latitude: event['latitude'],
        longitude: event['longitude'] },
      { showBackdrop: false,
        enableBackdropDismiss: false });
    modal.onDidDismiss(data => {
      this.logger.info(this, "changeLocation", "Modal", data);
    });
  }

  onCancel(event) {
    this.logger.info(this, "onCancel");
    this.viewController.dismiss();
  }

  postResponse(event:any=null) {
    this.logger.info(this, "postResponse");
    if (this.formGroup.valid) {
      let host = this.deployment.url;
      let title = this.getTitle(this.formGroup.value);
      let description = this.getDescription(this.formGroup.value);
      let values = this.sanitizeValues(this.formGroup.value);
      let loading = this.showLoading("Posting...");
      this.api.createPost(this.deployment, this.form.id, title, description, values).then(
        (resp) => {
          this.logger.info(this, "postResponse", resp);
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
          this.logger.error(this, "postResponse", error);
          loading.dismiss();
          this.showAlert('Post Failed', error);
        });
    }
    else {
      this.showAlert('Required Fields Missing', 'Please ensure all required fields are entered and try again.');
    }
  }

  getTitle(values:any) {
    for (let index in this.form.attributes) {
      let attribute = this.form.attributes[index];
      if (attribute.type == 'title') {
        return values[attribute.key];
      }
    }
    return null;
  }

  getDescription(values:any) {
    for (let index in this.form.attributes) {
      let attribute = this.form.attributes[index];
      if (attribute.type == 'description') {
        return values[attribute.key];
      }
    }
    return null;
  }

  sanitizeValues(values:any) {
    this.logger.info(this, "sanitizeValues", "Values", values);
    let sanitized = {};
    for (let index in this.form.attributes) {
      let attribute:Attribute = this.form.attributes[index];
      let key = attribute.key;
      let value = values[key];
      this.logger.info(this, "sanitizeValues", "Value", attribute.label, attribute.input, key, value);
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
    this.logger.info(this, "sanitizeValues", "Sanitized", sanitized);
    return sanitized;
  }

}
