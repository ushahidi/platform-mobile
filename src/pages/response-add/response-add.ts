import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, NavParams, Events, Content,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController  } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { Deployment } from '../../models/deployment';
import { Post } from '../../models/post';
import { Form } from '../../models/form';
import { Value } from '../../models/value';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';
import { ResponseMapPage } from '../../pages/response-map/response-map';

@Component({
  selector: 'esponse-add-page',
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
  submitted: boolean = false;

  @ViewChild(Content)
  content: Content;

  constructor(
    public api:ApiService,
    public logger:LoggerService,
    public database:DatabaseService,
    public events:Events,
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
      super(zone, platform, logger, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.deployment = this.getParameter<Deployment>("deployment");
    this.form = this.getParameter<Form>("form");
    this.post = this.getParameter<Post>("post");
    if (this.form) {
      this.color = this.form.color;
    }
    this.loadUpdates();
  }

  loadUpdates(event:any=null) {
    this.logger.info(this, "loadUpdates");
    let updates = [
      this.loadPostValues(),
      this.loadFormGroup()];
    Promise.all(updates).then(
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
    this.post = null;
    this.viewController.dismiss();
  }

  onSubmit(event:any=null) {
    this.logger.info(this, "onSubmit");
    this.submitted = true;
    if (this.hasRequiredValues()) {
      this.loadFormValues();
      if (this.offline) {
        let loading = this.showLoading("Saving...");
        this.savePost(this.post).then(
          (saved) => {
            this.events.publish('post:updated', this.post.id);
            loading.dismiss();
            let buttons = [{
              text: 'Ok',
              role: 'cancel',
              handler: () => {
                this.viewController.dismiss();
              }
            }];
            this.showAlert('Response Saved', 'Your response has been saved!', buttons);
          },
          (error) => {
            loading.dismiss();
            this.showAlert('Save Failed', 'There was a problem saving your response.');
          });
      }
      else if (this.post.id > 0) {
        let loading = this.showLoading("Updating...");
        this.updatePost(this.post).then(
          (updated) => {
            this.events.publish('post:updated', this.post.id);
            loading.dismiss();
            let buttons = [{
              text: 'Ok',
              role: 'cancel',
              handler: () => {
                this.viewController.dismiss();
              }
            }];
            this.showAlert('Response Updated', 'Your response has been updated!', buttons);
          },
          (error) => {
            loading.dismiss();
            this.showAlert('Update Failed', 'There was a problem updating your response.');
          });
      }
      else {
        let loading = this.showLoading("Posting...");
        this.createPost(this.post).then(
          (updated) => {
            this.events.publish('post:updated', this.post.id);
            loading.dismiss();
            let buttons = [{
              text: 'Ok',
              role: 'cancel',
              handler: () => {
                this.viewController.dismiss();
              }
            }];
            this.showAlert('Response Posted', 'Your response has been posted!', buttons);
          },
          (error) => {
            loading.dismiss();
            this.showAlert('Post Failed', 'There was a problem posting your response.');
          });
      }
    }
    else {
      this.showAlert('Required Fields Missing', 'Please ensure all required fields are entered and try again.');
    }
  }

  savePost(post:Post) {
    this.logger.info(this, "savePost", post);
    return new Promise((resolve, reject) => {
      this.logger.info(this, "savePost", "Saving...");
      post.pending = true;
      let saves = [
        this.database.savePost(this.deployment, post)
      ];
      for (let value of post.values) {
        value.post_id = post.id;
        saves.push(this.database.saveValue(this.deployment, value));
      }
      Promise.all(saves).then(
        (saved) => {
          this.logger.info(this, "savePost", "Saved", saved);
          resolve();
        },
        (error) => {
          this.logger.error(this, "savePost", "Failed", error);
          reject(error);
        });
    });
  }

  createPost(post:Post) {
    this.logger.info(this, "createPost", post);
    return new Promise((resolve, reject) => {
      this.logger.info(this, "createPost", "Posting...");
      this.api.createPostWithMedia(this.deployment, post).then(
        (posted:any) => {
          this.logger.info(this, "createPost", "Posted", posted);
          post.id = posted.id;
          post.pending = false;
          let saves = [
            this.database.savePost(this.deployment, post)
          ];
          for (let value of post.values) {
            value.post_id = posted.id;
            saves.push(this.database.saveValue(this.deployment, value));
          }
          Promise.all(saves).then(
            (saved) => {
              this.logger.info(this, "createPost", "Saved", saved);
              resolve();
            },
            (error) => {
              this.logger.error(this, "createPost", "Failed", error);
              reject(error);
            });
        },
        (error) => {
          this.logger.error(this, "createPost", "Failed", error);
          reject(error);
        });
    });
  }

  updatePost(post:Post) {
    this.logger.info(this, "updatePost", post);
    return new Promise((resolve, reject) => {
      this.logger.info(this, "updatePost", "Updating...");
      this.api.updatePostWithMedia(this.deployment, post).then(
        (success) => {
          this.logger.info(this, "updatePost", "Updated", success);
          let saves = [
            this.database.savePost(this.deployment, post)
          ];
          for (let value of post.values) {
            saves.push(this.database.saveValue(this.deployment, value));
          }
          Promise.all(saves).then(
            (saved) => {
              this.logger.info(this, "updatePost", "Saved", saved);
              resolve();
            },
            (error) => {
              this.logger.error(this, "updatePost", "Failed", error);
              reject(error);
            });
        },
        (error) => {
          this.logger.error(this, "updatePost", "Failed", error);
          reject(error);
        });
    });
  }

  loadPostValues() {
    this.logger.info(this, "loadPostValues");
    if (this.post == null) {
      this.post = new Post();
      this.post.pending = true;
      this.post.status = 'draft';
      this.database.getPostsLowestID().then(id => {
        this.post.id = Math.min(id, 0) - 1;
      });
      this.post.deployment_id = this.deployment.id;
      this.post.user_id = this.deployment.user_id;
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
          let coordinates = (text) ? text.split(',') : [];
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

  loadFormValues() {
    let formValues = this.formGroup.value;
    this.logger.info(this, "loadFormValues", formValues);
    for (let attribute of this.form.attributes) {
      let value = formValues[attribute.key];
      if (attribute.type == 'title') {
        this.post.title = value;
      }
      else if (attribute.type == 'description') {
        this.post.description = value;
      }
      else if (attribute.type == 'location') {
        if (value) {
          this.post.latitude = value.lat;
          this.post.longitude = value.lon;
        }
      }
    }
    for (let postValue of this.post.values) {
      let formValue = formValues[postValue.key];
      if (postValue.input == 'checkbox' || postValue.input == 'checkboxes') {
        let checks = [];
        for (let key in formValue) {
          if (formValue[key] == true || formValue[key] == 1) {
            checks.push(key);
          }
        }
        postValue.value = checks.join(",");
      }
      else if (postValue.input == 'location') {
        if (formValue && formValue.lat && formValue.lon) {
          postValue.value = `${formValue.lat},${formValue.lon}`;
        }
        else {
          postValue.value = formValue;
        }
      }
      else {
        postValue.value = formValue;
      }
    }
    this.logger.info(this, "loadFormValues", "Post", this.post);
  }

  changeLocation(event, key) {
    this.logger.info(this, "changeLocation", event);
    let modal = this.showModal(ResponseMapPage,
      { latitude: event['latitude'],
        longitude: event['longitude'] },
      { showBackdrop: true,
        enableBackdropDismiss: false });
    modal.onDidDismiss(data => {
      this.logger.info(this, "changeLocation", "Modal", data);
      if (data) {
        this.post.latitude = data['latitude'];
        this.post.longitude = data['longitude'];
        let value = this.values[key];
        value.value = `${data['latitude']},${data['longitude']}`
      }
    });
  }

  hasRequiredValues():boolean {
    return this.formGroup.valid == true;
  }

  getVideos():string[] {
    let videos:string[] = [];
    let values = this.formGroup.value;
    for (let attribute of this.form.attributes) {
      if (attribute.input == 'video') {
        let video = values[attribute.key];
        if (video && video.length > 0) {
          videos.push(video);
        }
      }
    }
    return videos;
  }

  getImages():string[] {
    let images:string[] = [];
    let values = this.formGroup.value;
    for (let attribute of this.form.attributes) {
      if (attribute.input == 'upload') {
        let image = values[attribute.key];
        if (image && image.length > 0) {
          images.push(image);
        }
      }
    }
    return images;
  }

}
