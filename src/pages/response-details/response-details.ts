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
          let tags:Tag[] = <Tag[]>results[4];
          this.post.loadUser(users);
          this.post.loadForm(forms);
          let saves = [];
          for (let value of this.post.values) {
            value.loadAttribute(attributes);
            value.loadTags(tags);
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

  showOptions(post:Post) {
    this.language.getTranslations([
      'ACTION_SHARE',
      'ACTION_COLLECTION',
      'ACTION_REVIEW',
      'ACTION_ARCHIVE',
      'ACTION_PUBLISH',
      'ACTION_DELETE',
      'ACTION_REMOVE',
      'ACTION_CANCEL']).then((translations:string[]) => {
        this.logger.info(this, "showOptions");
        let buttons = [];
        if (post.can_read) {
          buttons.push({
            text: translations[0],
            handler:() => this.shareResponse(post)
          });
        }
        if (this.offline == false && post.can_update) {
          if (this.deployment.collections && this.deployment.collections.length > 0) {
            buttons.push({
              text: translations[1],
              handler:() => this.addToCollection(post)
            });
          }
          if (post.status == 'published' || post.status == 'archived') {
           buttons.push({
             text: translations[2],
             handler:() => this.draftResponse(post)
           });
          }
          if (post.status == 'published' || post.status == 'draft') {
           buttons.push({
             text: translations[3],
             handler:() => this.archiveResponse(post)
           });
          }
          if (post.status == 'archived' || post.status == 'draft') {
            buttons.push({
              text: translations[4],
              handler:() => this.publishResponse(post)
            });
          }
        }
        if (this.offline == false && post.can_delete) {
          buttons.push({
            text: translations[5],
            role: 'destructive',
            handler:() => this.deleteResponse(post)
          });
        }
        if (post.pending == true) {
          buttons.push({
            text: translations[6],
            role: 'destructive',
            handler:() => this.removeResponse(post)
          });
        }
        buttons.push({
          text: translations[7],
          role: 'cancel'
        });
       this.showActionSheet(null, buttons);
    });
  }

  shareResponse(event:any) {
    this.language.getTranslations(['RESPONSE_SHARED']).then((translations:string[]) => {
        let subject:string = `${this.deployment.name} | ${this.post.title}`;
        let message:string = this.post.description
        let file:string = this.post.image_url;
        let url:string = this.post.url;
        this.logger.info(this, "shareResponse", "Subject", subject, "Message", message, "File", file, "URL", url);
        this.showShare(subject, message, file, url).then(
          (shared:boolean) => {
            if (shared) {
              this.showToast(translations[0]);
              this.trackEvent("Posts", "shared", this.post.url);
            }
          },
          (error:any) => {
            this.showToast(error);
        });
    });
  }

  editResponse(event:any) {
    this.logger.info(this, "editResponse");
    let modal = this.showModal(ResponseAddPage,
      { deployment: this.deployment,
        login: this.login,
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
    this.language.getTranslations([
      'RESPONSE_ARCHIVING_',
      'RESPONSE_ARCHIVE_SUCCESS',
      'RESPONSE_ARCHIVE_FAILURE']).then((translations:string[]) => {
      let loading = this.showLoading(translations[0]);
      let changes = { status: "archived" };
      this.api.updatePost(this.deployment, post, changes).then(
        (updated:any) => {
          post.status = "archived";
          this.database.savePost(this.deployment, post).then(saved => {
            loading.dismiss();
            this.events.publish(POST_UPDATED, post.id);
            this.showToast(translations[1]);
            this.trackEvent("Posts", "archived", this.post.url);
          });
        },
        (error:any) => {
          loading.dismiss();
          this.showAlert(translations[2], error);
        });
    });
  }

  publishResponse(post:Post) {
    this.logger.info(this, "publishResponse");
    this.language.getTranslations([
      'RESPONSE_PUBLISHING_',
      'RESPONSE_PUBLISH_SUCCESS',
      'RESPONSE_PUBLISH_FAILURE']).then((translations:string[]) => {
      let loading = this.showLoading(translations[0]);
      let changes = { status: "published" };
      this.api.updatePost(this.deployment, post, changes).then(
        (updated:any) => {
          post.status = "published";
          this.database.savePost(this.deployment, post).then(saved => {
            loading.dismiss();
            this.events.publish('post:updated', post.id);
            this.showToast(translations[1]);
            this.trackEvent("Posts", "published", this.post.url);
          });
        },
        (error:any) => {
          loading.dismiss();
          this.showAlert(translations[2], error);
        });
    });
  }

  removeResponse(post:Post) {
    this.language.getTranslations([
      'RESPONSE_REMOVING_',
      'RESPONSE_REMOVE_SUCCESS',
      'RESPONSE_REMOVE_FAILURE']).then((translations:string[]) => {
      this.logger.info(this, "removeResponse");
      let loading = this.showLoading(translations[0]);
      this.database.removeValues(this.deployment, post).then(
        (values) => {
          this.database.removePost(this.deployment, post).then(
            (removed) => {
              loading.dismiss();
              this.showToast(translations[1]);
              this.trackEvent("Posts", "removed", post.url);
              this.closePage();
            },
            (error) => {
              loading.dismiss();
              this.showAlert(translations[2], error);
          });
        },
        (error) => {
          loading.dismiss();
          this.showAlert(translations[2], error);
      });
    });
  }

  deleteResponse(post:Post) {
    this.language.getTranslations([
      'ACTION_DELETE',
      'RESPONSE_DELETING_',
      'RESPONSE_DELETE_SUCCESS',
      'RESPONSE_DELETE_FAILURE',
      'RESPONSE_DELETE_CONFIRM',
      'RESPONSE_DELETE_CONFIRM_DESCRIPTION']).then((translations:string[]) => {
        let buttons = [
           {
             text: translations[0],
             role: 'destructive',
             handler: () => {
               this.logger.info(this, "deleteResponse", 'Delete');
               let loading = this.showLoading(translations[1]);
               this.api.deletePost(this.deployment, post).then(
                 (results:any) => {
                   loading.dismiss();
                   this.database.removePost(this.deployment, post).then(removed => {
                     this.showToast(translations[2]);
                     this.trackEvent("Posts", "deleted", post.url);
                     this.closePage();
                  });
                 },
                 (error:any) => {
                   loading.dismiss();
                   this.showAlert(translations[3], error);
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
         this.showConfirm(translations[4], translations[5], buttons);
    });
  }

}
