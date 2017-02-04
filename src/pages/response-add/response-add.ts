import { Component, ViewChild, NgZone } from '@angular/core';
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
import { Post } from '../../models/post';
import { Form } from '../../models/form';
import { Attribute } from '../../models/attribute';
import { Value } from '../../models/value';

@Component({
  selector: 'page-response-add',
  templateUrl: 'response-add.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ ResponseMapPage ]
})
export class ResponseAddPage extends BasePage {

  deployment: Deployment = null;
  post: Post = null;
  form: Form = null;
  values : {} = {};
  formGroup: FormGroup = null;
  color: string = "#cccccc";

  constructor(
    public api:ApiService,
    public logger:LoggerService,
    public database:DatabaseService,
    public navParams: NavParams,
    public zone: NgZone,
    public platform:Platform,
    public navController:NavController,
    public viewController:ViewController,
    public modalController:ModalController,
    public toastController:ToastController,
    public alertController:AlertController,
    public loadingController:LoadingController,
    public actionController:ActionSheetController,
    public formBuilder: FormBuilder) {
      super(zone, platform, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.logger.info(this, 'ionViewDidLoad');
    this.deployment = <Deployment>this.navParams.get("deployment");
    this.form = <Form>this.navParams.get("form");
    this.post = <Post>this.navParams.get("post");
    if (this.form) {
      this.color = this.form.color;
    }
    this.loadUpdates();
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.logger.info(this, "ionViewWillEnter");
  }

  loadUpdates(event:any=null) {
    this.logger.info(this, "loadUpdates");
    let promises = [
      this.loadFormGroup(),
      this.loadPostValues()];
    Promise.all(promises).then(
      (done) => {
        this.logger.info(this, "loadUpdates", "Done");
        if (event) {
          event.complete();
        }
      },
      (error) => {
        this.logger.error(this, "loadUpdates", error);
        if (event) {
          event.complete();
        }
      });
  }

  onCancel(event) {
    this.logger.info(this, "onCancel");
    this.viewController.dismiss();
  }

  onSubmit(event:any=null) {
    this.logger.info(this, "onSubmit");
    if (this.formGroup.valid) {
      let title = this.getTitle(this.formGroup.value);
      let description = this.getDescription(this.formGroup.value);
      let values = this.sanitizeValues(this.formGroup.value);
      if (this.offline) {
        this.savePost(title, description, values);
      }
      else if (this.post.id > 0) {
        this.updatePost(this.post, values);
      }
      else {
        this.createPost(title, description, values);
      }
    }
    else {
      this.showAlert('Required Fields Missing', 'Please ensure all required fields are entered and try again.');
    }
  }

  savePost(title:string, description:string, values:any) {
    this.logger.info(this, "savePost", title, description, values);
    let loading = this.showLoading("Saving...");
    this.post.pending = true;
    this.post.title = title;
    this.post.description = description;
    let location = this.getLocation(this.formGroup.value);
    if (location) {
      this.post.latitude = location.split(",")[0];
      this.post.longitude = location.split(",")[1];
    }
    for (let i = 0; i < this.post.values.length; i++) {
      let value:Value = this.post.values[i];
      value.value = values[value.key];
    }
    this.database.savePost(this.deployment, this.post).then(
      (saved) => {
        this.logger.info(this, "savePost", "Saved", saved);
        loading.dismiss();
        let buttons = [{
          text: 'Ok',
          role: 'cancel',
          handler: () => {
            this.viewController.dismiss();
          }
        }];
        this.showAlert('Save Successful', 'Your response has been saved!', buttons);
      },
      (error) => {
        this.logger.error(this, "savePost", error);
        loading.dismiss();
        this.showAlert('Save Failed', error);
      });
  }

  createPost(title:string, description:string, values:any) {
    this.logger.info(this, "createPost", title, description, values);
    let loading = this.showLoading("Posting...");
    this.api.createPost(this.deployment, this.form.id, title, description, values).then(
      (resp) => {
        this.logger.info(this, "createPost", "Posted", resp);
        loading.dismiss();
        if (resp) {
          let buttons = [{
            text: 'Ok',
            role: 'cancel',
            handler: () => {
              this.viewController.dismiss();
            }
          }];
          this.showAlert('Post Successful', 'Your response has been posted!', buttons);
        }
        else {
          this.showAlert('Post Failed', 'There was a problem posting your response.');
        }
      },
      (error) => {
        this.logger.error(this, "createPost", error);
        loading.dismiss();
        this.showAlert('Post Failed', error);
      });
  }

  updatePost(post:Post, values:any) {
    this.logger.info(this, "updatePost", values);
    let loading = this.showLoading("Updating...");
    this.api.updatePost(this.deployment, post, values).then(
      (success) => {
        this.logger.info(this, "updatePost", "Posted", success);
        loading.dismiss();
        if (success) {
          let buttons = [{
            text: 'Ok',
            role: 'cancel',
            handler: () => {
              this.viewController.dismiss();
            }
          }];
          this.showAlert('Update Successful', 'Your response has been updated!', buttons);
        }
        else {
          this.showAlert('Update Failed', 'There was a problem updating your response.');
        }
      },
      (error) => {
        this.logger.error(this, "updatePost", error);
        loading.dismiss();
        this.showAlert('Update Failed', error);
      });
  }

  loadPostValues() {
    this.logger.info(this, "loadPostValues");
    if (this.post == null) {
      this.post = new Post();
      this.database.getPostLowestID().then(id => {
        this.post.id = Math.min(id, -1);
      });
      this.post.deployment_id = this.deployment.id;
      this.post.form_id = this.form.id;
      this.post.color = this.form.color;
      this.post.posted = new Date();
      this.post.created = new Date();
      this.post.updated = new Date();
      this.post.values = [];
      for (let index in this.form.attributes) {
        let attribute:Attribute = this.form.attributes[index];
        let value:Value = new Value();
        value.key = attribute.key;
        value.label = attribute.label;
        value.input = attribute.input;
        value.type = attribute.type;
        value.cardinality = attribute.cardinality;
        this.post.values.push(value);
      }
    }
    for (let index in this.form.attributes) {
      let attribute:Attribute = this.form.attributes[index];
      if (attribute.type == "title") {
        let title:Value = new Value();
        title.key = attribute.key;
        title.input = attribute.input;
        title.label = attribute.label;
        title.cardinality = attribute.cardinality;
        title.value = this.post.title;
        this.values[title.key] = title;
      }
      else if (attribute.type == "description") {
        let value:Value = new Value();
        value.key = attribute.key;
        value.input = attribute.input;
        value.label = attribute.label;
        value.cardinality = attribute.cardinality;
        value.value = this.post.description;
        this.values[attribute.key] = value;
      }
    }
    for (let index in this.post.values) {
      let value:Value = this.post.values[index];
      this.values[value.key] = value;
    }
    this.logger.info(this, "loadPostValues", "Values", this.values);
  }

  loadFormGroup() {
    this.logger.info(this, "loadFormGroup", "Form", this.form.name);
    this.formGroup = new FormGroup({});
    if (this.form && this.form.attributes) {
      for (let index in this.form.attributes) {
        let attribute:Attribute = this.form.attributes[index];
        if (attribute.input == 'location') {
          let validator: any = null;
          if (attribute.required == true) {
            validator = Validators.required;
          }
          let formGroup = new FormGroup({
            lat: new FormControl(''),
            lon: new FormControl('')}, validator);
          this.formGroup.addControl(attribute.key, formGroup);
        }
        else if (attribute.input == 'checkbox' || attribute.input == 'checkboxes') {
          let validator : any = null;
          if (attribute.required == true) {
            validator = Validators.required;
          }
          let formGroup = new FormGroup({}, validator);
          let options = attribute.getOptions();
          for (let index in options) {
            formGroup.addControl(options[index], new FormControl(''));
          }
          this.formGroup.addControl(attribute.key, formGroup);
        }
        else {
          let validators = [];
          if (attribute.required == true) {
            validators.push(Validators.required);
          }
          this.formGroup.addControl(attribute.key, new FormControl('', validators));
        }
      }
    }
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

  getLocation(values:any) {
    for (let index in this.form.attributes) {
      let attribute = this.form.attributes[index];
      if (attribute.type == 'location') {
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
