import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, NavParams, Button, Events,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController  } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { ResponseAddPage } from '../../pages/response-add/response-add';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { Deployment } from '../../models/deployment';
import { Post } from '../../models/post';
import { User } from '../../models/user';
import { Form } from '../../models/form';
import { Image } from '../../models/image';
import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';
import { Collection } from '../../models/collection';

import { PLACEHOLDER_USER, PLACEHOLDER_NAME } from '../../helpers/constants';

@Component({
  selector: 'page-response-details',
  templateUrl: 'response-details.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ ResponseAddPage ]
})
export class ResponseDetailsPage extends BasePage {

  color: string = "#cccccc";
  deployment: Deployment = null;
  post: Post = null;
  form: Form = null;
  userName:string = PLACEHOLDER_NAME;
  userImage:string = PLACEHOLDER_USER;
  userPlaceholder:string = PLACEHOLDER_USER;

  constructor(
    public api:ApiService,
    public logger:LoggerService,
    public database:DatabaseService,
    public events:Events,
    public navParams:NavParams,
    public zone: NgZone,
    public platform:Platform,
    public navController:NavController,
    public viewController:ViewController,
    public modalController:ModalController,
    public toastController:ToastController,
    public alertController:AlertController,
    public loadingController:LoadingController,
    public actionController:ActionSheetController) {
      super(zone, platform, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.logger.info(this, 'ionViewDidLoad');
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.logger.info(this, "ionViewWillEnter");
    this.deployment = this.navParams.get("deployment");
    this.post = this.navParams.get("post");
    this.color = this.post.color;
    this.loadUpdates();
  }

  loadUpdates(event:any=null, cache:boolean=true) {
    this.logger.info(this, "loadUpdates");
    let promises = [
      this.loadForm(cache),
      this.loadValues(cache)];
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

  loadForm(cache:boolean=true) {
    if (cache && this.form && this.form.attributes) {
      this.logger.info(this, "loadForm", "Cache", this.form);
    }
    else {
      return this.database.getFormWithAttributes(this.deployment, this.post.form_id).then(
        (results) => {
          this.logger.info(this, "loadForm", "Database", results);
          this.form = <Form>results;
        },
        (error) => {
          this.logger.error(this, "loadForm", "Database", error);
        });
    }
  }

  loadValues(cache:boolean=true) {
    this.logger.info(this, "loadValues", "Cache", cache);
    if (cache && this.post && this.post.values && this.post.values.length > 0) {
      this.logger.info(this, "loadValues", "Cached", this.post.values);
    }
    else {
      return this.database.getValues(this.deployment, this.post).then(
        (results) => {
          this.logger.info(this, "loadValues", "Database", results);
          this.post.values = <any[]>results;
        },
        (error) => {
          this.logger.error(this, "loadValues", "Database", error);
        });
    }
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
      (shared) => {
        if (shared) {
          this.showToast("Response Shared");
        }
      },
      (error) => {
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

  addToCollection(post:Post, collection:Collection=null) {
    this.logger.info(this, "addToCollection");
    if (collection != null) {
      let loading = this.showLoading("Adding...");
      this.api.addPostToCollection(this.deployment, post, collection).then(
        (results) => {
          loading.dismiss();
          this.showToast("Added To Collection");
        },
        (error) => {
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
      (updated) => {
        post.status = "draft";
        this.database.savePost(this.deployment, post).then(saved => {
          loading.dismiss();
          this.events.publish('post:updated', post.id);
          this.showToast("Responsed put under review");
        });
      },
      (error) => {
        loading.dismiss();
        this.showAlert("Problem Updating Response", error);
      });
  }

  archiveResponse(post:Post) {
    this.logger.info(this, "archiveResponse");
    let loading = this.showLoading("Archiving...");
    let changes = { status: "archived" };
    this.api.updatePost(this.deployment, post, changes).then(
      (updated) => {
        post.status = "archived";
        this.database.savePost(this.deployment, post).then(saved => {
          loading.dismiss();
          this.events.publish('post:updated', post.id);
          this.showToast("Response archived");
        });
      },
      (error) => {
        loading.dismiss();
        this.showAlert("Problem Updating Response", error);
      });
  }

  publishResponse(post:Post) {
    this.logger.info(this, "publishResponse");
    let loading = this.showLoading("Publishing...");
    let changes = { status: "published" };
    this.api.updatePost(this.deployment, post, changes).then(
      (updated) => {
        post.status = "published";
        this.database.savePost(this.deployment, post).then(saved => {
          loading.dismiss();
          this.events.publish('post:updated', post.id);
          this.showToast("Response archived");
        });
      },
      (error) => {
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
             (results) => {
               loading.dismiss();
               this.database.removePost(this.deployment, post).then(removed => {
                 this.showToast("Response deleted");
                 this.logger.info(this, 'Events', 'post:deleted', post.id);
                 this.events.publish('post:deleted', post.id);
                 this.closePage();
              });
             },
             (error) => {
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
