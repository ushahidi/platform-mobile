import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, Events, Content, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Login } from '../../models/login';
import { Deployment } from '../../models/deployment';
import { Post } from '../../models/post';
import { Form } from '../../models/form';
import { User } from '../../models/user';
import { Image } from '../../models/image';
import { Attribute } from '../../models/attribute';
import { Collection } from '../../models/collection';
import { Tag } from '../../models/tag';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';
import { ResponseAddPage } from '../../pages/response-add/response-add';
import { ResponseMapPage } from '../../pages/response-map/response-map';
import { ResponseImagePage } from '../../pages/response-image/response-image';

import { POST_UPDATED, POST_DELETED } from '../../constants/events';
import { PLACEHOLDER_USER, PLACEHOLDER_NAME } from '../../constants/placeholders';

@Component({
  selector: 'response-details-page',
  templateUrl: 'response-details.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ ResponseAddPage, ResponseMapPage, ResponseImagePage ]
})
export class ResponseDetailsPage extends BasePage {

  color:string = "#cccccc";
  login:Login = null;
  deployment:Deployment = null;
  post:Post = null;
  form:Form = null;
  userName:string = PLACEHOLDER_NAME;
  userImage:string = PLACEHOLDER_USER;
  userPlaceholder:string = PLACEHOLDER_USER;

  @ViewChild(Content)
  content:Content;

  constructor(
    protected zone:NgZone,
    protected platform:Platform,
    protected navParams:NavParams,
    protected navController:NavController,
    protected viewController:ViewController,
    protected modalController:ModalController,
    protected toastController:ToastController,
    protected alertController:AlertController,
    protected loadingController:LoadingController,
    protected actionController:ActionSheetController,
    protected logger:LoggerService,
    protected api:ApiService,
    protected database:DatabaseService,
    protected events:Events) {
    super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, logger);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.deployment = this.getParameter<Deployment>("deployment");
    this.login = this.getParameter<Login>("login");
    this.post = this.getParameter<Post>("post");
    this.color = this.post.color;
    this.loadUpdates();
  }

  loadUpdates(event:any=null, cache:boolean=true) {
    this.logger.info(this, "loadUpdates");
    return Promise.resolve()
      .then(() => { return this.loadForm(cache); })
      .then(() => { return this.loadValues(cache); })
      .then(() => { return this.loadTags(cache); })
      .then(() => {
        this.logger.info(this, "loadUpdates", "Finished");
        if (event) {
          event.complete();
        }
      })
      .catch((error) => {
        this.logger.error(this, "loadUpdates", "Failed", error);
        if (event) {
          event.complete();
        }
      });
  }

  loadForm(cache:boolean=true):Promise<any> {
    if (cache && this.form && this.form.attributes) {
      this.logger.info(this, "loadForm", "Cache", this.form);
      return Promise.resolve();
    }
    else {
      return new Promise((resolve, reject) => {
        this.database.getFormWithAttributes(this.deployment, this.post.form_id).then(
          (form:Form) => {
            this.logger.info(this, "loadForm", "Database", form);
            this.form = form;
            resolve();
          },
          (error:any) => {
            this.logger.error(this, "loadForm", "Database", error);
            reject(error);
          });
      });
    }
  }

  loadValues(cache:boolean=true):Promise<any> {
    this.logger.info(this, "loadValues", "Cache", cache);
    if (cache && this.post.hasValues()) {
      this.logger.info(this, "loadValues", "Cached");
      return Promise.resolve();
    }
    else {
      return new Promise((resolve, reject) => {
        Promise.all([
          this.database.getUsers(this.deployment),
          this.database.getImages(this.deployment),
          this.database.getForms(this.deployment),
          this.database.getAttributes(this.deployment),
          this.database.getTags(this.deployment)]).then((results:any[]) => {
          let users:User[] = <User[]>results[0];
          let images:Image[] = <Image[]>results[1];
          let forms:Form[] = <Form[]>results[2];
          let attributes:Attribute[] = <Attribute[]>results[3];
          this.post.loadUser(users);
          this.post.loadForm(forms);
          let saves = [];
          for (let value of this.post.values) {
            value.loadAttribute(attributes);
            if (value.input == 'upload') {
              value.loadImage(images);
              this.post.loadImage(images, value.value);
            }
            saves.push(this.database.saveValue(this.deployment, value));
          }
          saves.push(this.database.savePost(this.deployment, this.post));
          Promise.all(saves).then(
            (saved) => {
              this.logger.info(this, "loadValues", "Loaded");
              resolve();
            },
            (error) => {
              this.logger.error(this, "loadValues", "Failed", error);
              reject(error);
            });
        });
      });
    }
  }

  loadTags(cache:boolean=true):Promise<any> {
    return new Promise((resolve, reject) => {
      this.database.getTags(this.deployment).then((tags:Tag[]) => {
        for (let value of this.post.values) {
          value.loadTags(tags);
        }
        resolve(true);
      });
    });
  }

  showOptions(event:any) {
    this.logger.info(this, "showOptions");
    let buttons = [];
    if (this.post.can_read) {
       buttons.push({
         text: 'Share',
         handler:() => this.shareResponse(this.post)
       });
    }
    if (this.offline == false && this.post.can_update) {
      buttons.push({
        text: 'Edit',
        handler:() => this.editResponse(this.post)
      });
      if (this.deployment.collections && this.deployment.collections.length > 0) {
        buttons.push({
         text: 'Add to Collection',
         handler:() => this.addToCollection(this.post)
        });
      }
      if (this.post.status == 'published' || this.post.status == 'draft') {
       buttons.push({
         text: 'Archive',
         handler:() => this.archiveResponse(this.post)
       });
      }
      if (this.post.status == 'archived' || this.post.status == 'draft') {
        buttons.push({
          text: 'Publish',
          handler:() => this.publishResponse(this.post)
        });
      }
    }
    if (this.offline == false && this.post.can_delete) {
      buttons.push({
       text: 'Delete',
       role: 'destructive',
       handler:() => this.deleteResponse(this.post)
      });
    }
    buttons.push({
      text: 'Cancel',
      role: 'cancel'
    });
   this.showActionSheet(null, buttons);
  }

  shareResponse(event:any) {
    let subject:string = `${this.deployment.name} | ${this.post.title}`;
    let message:string = this.post.description
    let file:string = this.post.image_url;
    let url:string = this.post.url;
    this.logger.info(this, "shareResponse", "Subject", subject, "Message", message, "File", file, "URL", url);
    this.showShare(subject, message, file, url).then(
      (shared:boolean) => {
        if (shared) {
          this.showToast("Response Shared");
          this.trackEvent("Posts", "shared", this.post.url);
        }
      },
      (error:any) => {
        this.showToast(error);
    });
  }

  editResponse(event:any) {
    this.logger.info(this, "editResponse");
    let modal = this.showModal(ResponseAddPage,
      { deployment: this.deployment,
        post: this.post,
        form: this.form });
    modal.onDidDismiss(data => {
      this.logger.info(this, "editResponse", "Modal", data);
    });
  }

  showImage(title:string, image:string) {
    this.logger.info(this, "showImage", title, image);
    this.showPage(ResponseImagePage, {
      deployment: this.deployment,
      post: this.post,
      title: title,
      image: image
    });
  }

  showLocation(title:string, coordinates:string) {
    this.logger.info(this, "showLocation", title, coordinates);
    if (coordinates && coordinates.length > 0) {
      let location = coordinates.split(",");
      if (location && location.length > 0) {
        this.showPage(ResponseMapPage, {
          modal: false,
          draggable: false,
          title: title,
          deployment: this.deployment,
          latitude: location[0],
          longitude: location[1]
        });
      }
    }
  }

  addToCollection(post:Post, collection:Collection=null) {
    this.logger.info(this, "addToCollection");
    if (collection != null) {
      let loading = this.showLoading("Adding...");
      this.api.addPostToCollection(this.deployment, post, collection).then(
        (results:any) => {
          loading.dismiss();
          this.showToast("Added To Collection");
          this.trackEvent("Posts", "collected", post.url);
        },
        (error:any) => {
          loading.dismiss();
          this.showAlert("Problem Adding To Collection", error);
      })
    }
    else if (this.deployment.collections != null) {
      let buttons = [];
      for (let index in this.deployment.collections) {
        let collection:Collection = this.deployment.collections[index];
        buttons.push({
          text: collection.name,
          handler:() => this.addToCollection(post, collection)
        });
      }
      buttons.push({
        text: 'Cancel',
        role: 'cancel'
      });
      this.showActionSheet("Select Collection", buttons);
    }
  }

  draftResponse(post:Post) {
    this.logger.info(this, "draftResponse");
    let loading = this.showLoading("Updating...");
    let changes = { status: "draft" };
    this.api.updatePost(this.deployment, post, changes).then(
      (updated:any) => {
        post.status = "draft";
        this.database.savePost(this.deployment, post).then(saved => {
          loading.dismiss();
          this.events.publish(POST_UPDATED, post.id);
          this.showToast("Responsed put under review");
          this.trackEvent("Posts", "drafted", this.post.url);
        });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Updating Response", error);
      });
  }

  archiveResponse(post:Post) {
    this.logger.info(this, "archiveResponse");
    let loading = this.showLoading("Archiving...");
    let changes = { status: "archived" };
    this.api.updatePost(this.deployment, post, changes).then(
      (updated:any) => {
        post.status = "archived";
        this.database.savePost(this.deployment, post).then(saved => {
          loading.dismiss();
          this.events.publish(POST_UPDATED, post.id);
          this.showToast("Response archived");
          this.trackEvent("Posts", "archived", this.post.url);
        });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Updating Response", error);
      });
  }

  publishResponse(post:Post) {
    this.logger.info(this, "publishResponse");
    let loading = this.showLoading("Publishing...");
    let changes = { status: "published" };
    this.api.updatePost(this.deployment, post, changes).then(
      (updated:any) => {
        post.status = "published";
        this.database.savePost(this.deployment, post).then(saved => {
          loading.dismiss();
          this.events.publish('post:updated', post.id);
          this.showToast("Response published");
          this.trackEvent("Posts", "published", this.post.url);
        });
      },
      (error:any) => {
        loading.dismiss();
        this.showAlert("Problem Updating Response", error);
      });
  }

  deleteResponse(post:Post) {
    let buttons = [
       {
         text: 'Delete',
         role: 'destructive',
         handler: () => {
           this.logger.info(this, "deleteResponse", 'Delete');
           let loading = this.showLoading("Deleting...");
           this.api.deletePost(this.deployment, post).then(
             (results:any) => {
               loading.dismiss();
               this.database.removePost(this.deployment, post).then(removed => {
                 this.showToast("Response deleted");
                 this.events.publish(POST_DELETED, post.id);
                 this.trackEvent("Posts", "deleted", this.post.url);
                 this.closePage();
              });
             },
             (error:any) => {
               loading.dismiss();
               this.showAlert("Problem Deleting Response", error);
             });
         }
       },
       {
         text: 'Cancel',
         role: 'cancel',
         handler: () => {
           this.logger.info(this, "deleteResponse", 'Cancel');
         }
       }
     ];
     this.showConfirm("Delete Response", "Are you sure you want to delete this response?", buttons);
  }

}
