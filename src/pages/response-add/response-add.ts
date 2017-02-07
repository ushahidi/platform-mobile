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
      this.loadPostValues(),
      this.loadFormGroup()];
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

  onCancel(event:any=null) {
    this.logger.info(this, "onCancel");
    this.viewController.dismiss();
  }

  onSubmit(event:any=null) {
    this.logger.info(this, "onSubmit");
    if (this.formGroup.valid) {
      this.post.title = this.getTitle(this.formGroup.value);
      this.post.description = this.getDescription(this.formGroup.value);
      let location = this.getLocation(this.formGroup.value);
      if (location) {
        this.post.latitude = location.split(",")[0];
        this.post.longitude = location.split(",")[1];
      }
      let values = this.sanitizeValues(this.formGroup.value);
      for (let value of this.post.values) {
        value.value = values[value.key];
      }
      if (this.offline) {
        this.savePost(this.post);
      }
      else if (this.post.id > 0) {
        this.updatePost(this.post);
      }
      else {
        this.createPost(this.post);
      }
    }
    else {
      this.showAlert('Required Fields Missing', 'Please ensure all required fields are entered and try again.');
    }
  }

  savePost(post:Post) {
    this.logger.info(this, "savePost", post);
    let loading = this.showLoading("Saving...");
    post.pending = true;
    this.database.savePost(this.deployment, post).then(
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

  createPost(post:Post) {
    this.logger.info(this, "createPost", post);
    let loading = this.showLoading("Posting...");
    this.api.createPost(this.deployment, post).then(
      (posted) => {
        this.logger.info(this, "createPost", "Posted", posted);
        this.database.savePost(this.deployment, post).then(
          (saved) => {
            loading.dismiss();
            let buttons = [{
              text: 'Ok',
              role: 'cancel',
              handler: () => {
                this.viewController.dismiss();
              }
            }];
            this.showAlert('Post Successful', 'Your response has been posted!', buttons);
        });
      },
      (error) => {
        this.logger.error(this, "createPost", error);
        loading.dismiss();
        this.showAlert('Post Failed', error);
      });
  }

  updatePost(post:Post) {
    this.logger.info(this, "updatePost", post);
    let loading = this.showLoading("Updating...");
    this.api.updatePost(this.deployment, post).then(
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
      this.post.pending = true;
      this.database.getPostsLowestID().then(id => {
        this.post.id = Math.min(id, -1);
      });
      this.post.deployment_id = this.deployment.id;
      this.post.form_id = this.form.id;
      this.post.color = this.form.color;
      this.post.posted = new Date();
      this.post.created = new Date();
      this.post.updated = new Date();
      this.post.values = [];
      for (let attribute of this.form.attributes) {
        let value:Value = new Value();
        value.post_id = this.post.id;
        value.deployment_id = this.deployment.id;
        value.key = attribute.key;
        value.label = attribute.label;
        value.input = attribute.input;
        value.type = attribute.type;
        value.cardinality = attribute.cardinality;
        this.post.values.push(value);
      }
    }
    for (let attribute of this.form.attributes) {
      if (attribute.type == "title") {
        let title:Value = new Value();
        title.post_id = this.post.id;
        title.deployment_id = this.deployment.id;
        title.key = attribute.key;
        title.input = attribute.input;
        title.label = attribute.label;
        title.cardinality = attribute.cardinality;
        title.value = this.post.title;
        this.values[title.key] = title;
      }
      else if (attribute.type == "description") {
        let description:Value = new Value();
        description.post_id = this.post.id;
        description.deployment_id = this.deployment.id;
        description.key = attribute.key;
        description.input = attribute.input;
        description.label = attribute.label;
        description.cardinality = attribute.cardinality;
        description.value = this.post.description;
        this.values[attribute.key] = description;
      }
    }
    for (let value of this.post.values) {
      this.values[value.key] = value;
    }
  }

  loadFormGroup() {
    this.logger.info(this, "loadFormGroup", "Form", this.form.name);
    this.formGroup = new FormGroup({});
    if (this.form && this.form.attributes) {
      for (let attribute of this.form.attributes) {
        let value:Value = this.values[attribute.key];
        let text:string = (value != null) ? value.value : '';
        let validator = (attribute.required == true) ? Validators.required : null;
        this.logger.info(this, "loadFormGroup", "Form", this.form.name, "Attribute", attribute.input, "Value", text);
        if (attribute.input == 'location') {
          let coordinates = (text != null) ? text.split(',') : '';
          let latitude = (coordinates.length > 1) ? coordinates[0] : '';
          let longitude = (coordinates.length > 1) ? coordinates[1] : '';
          let formGroup = new FormGroup({
            lat: new FormControl(latitude),
            lon: new FormControl(longitude)}, validator);
          this.formGroup.addControl(attribute.key, formGroup);
        }
        else if (attribute.input == 'checkbox' || attribute.input == 'checkboxes') {
          let formGroup = new FormGroup({}, validator);
          let options = attribute.getOptions();
          for (let option of options) {
            formGroup.addControl(option, new FormControl(''));
          }
          this.formGroup.addControl(attribute.key, formGroup);
        }
        else if (attribute.input == 'radio') {
          this.formGroup.addControl(attribute.key, new FormControl(text, validator));
        }
        else {
          this.formGroup.addControl(attribute.key, new FormControl(text, validator));
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
    for (let attribute of this.form.attributes) {
      if (attribute.type == 'title') {
        return values[attribute.key];
      }
    }
    return null;
  }

  getDescription(values:any) {
    for (let attribute of this.form.attributes) {
      if (attribute.type == 'description') {
        return values[attribute.key];
      }
    }
    return null;
  }

  getLocation(values:any) {
    for (let attribute of this.form.attributes) {
      if (attribute.type == 'location') {
        return values[attribute.key];
      }
    }
    return null;
  }

  sanitizeValues(values:any) {
    this.logger.info(this, "sanitizeValues", "Values", values);
    let sanitized = {};
    for (let attribute of this.form.attributes) {
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
