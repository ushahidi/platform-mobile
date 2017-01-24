import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, Button, Events,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController  } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';
import { ResponseEditPage } from '../../pages/response-edit/response-edit';

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

import { PLACEHOLDER_USER, PLACEHOLDER_NAME } from '../../helpers/constants';

@Component({
  selector: 'page-response-details',
  templateUrl: 'response-details.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ ResponseEditPage ]
})
export class ResponseDetailsPage extends BasePage {

  color: string = "#cccccc";
  deployment: Deployment = null;
  post: Post = null;
  userName:string = PLACEHOLDER_NAME;
  userImage:string = PLACEHOLDER_USER;

  constructor(
    public platform:Platform,
    public api:ApiService,
    public logger:LoggerService,
    public database:DatabaseService,
    public events:Events,
    public navParams:NavParams,
    public navController:NavController,
    public viewController:ViewController,
    public modalController:ModalController,
    public toastController:ToastController,
    public alertController:AlertController,
    public loadingController:LoadingController,
    public actionController:ActionSheetController) {
      super(navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewDidLoad() {
    this.logger.info(this, 'ionViewDidLoad');

  }

  ionViewWillEnter() {
    this.logger.info(this, "ionViewWillEnter");
    this.deployment = this.navParams.get("deployment");
    this.post = this.navParams.get("post");
    this.color = this.post.color;
    this.loadUpdates(null, true);
  }

  ionViewDidEnter() {
    this.logger.info(this, "ionViewDidEnter");
  }

  loadUpdates(event:any, cache:boolean=true) {
    this.logger.info(this, "loadUpdates");
    let promises = [
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
    this.logger.info(this, "showOptions");
    let buttons = [
      {
        text: 'Add to Collection',
        handler: () => {
          this.logger.info(this, "showOptions", 'Add to Collection');
          this.addToCollection(this.post);
        }
      },
      {
        text: 'Share',
        handler: () => {
          this.logger.info(this, "showOptions", 'Share');
          this.shareResponse(this.post);
        }
      },
      {
        text: 'Put under review',
        handler: () => {
          this.logger.info(this, "showOptions", 'Put Under Review');
          this.putUnderReview(this.post);
        }
      },
      {
         text: 'Edit',
         handler: () => {
           this.logger.info(this, "showOptions", 'Edit');
           this.editResponse(this.post);
         }
       },
       {
          text: 'Archive',
          handler: () => {
            this.logger.info(this, "showOptions", 'Archive');
            this.archiveResponse(this.post);
          }
        },
       {
         text: 'Delete',
         role: 'destructive',
         handler: () => {
           this.logger.info(this, "showOptions", 'Delete');
           this.deleteResponse(this.post);
         }
       },
       {
         text: 'Cancel',
         role: 'cancel',
         handler: () => {
           this.logger.info(this, "showOptions", 'Cancel');
         }
       }
     ];
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
    this.showToast('Edit Not Implemented');
    // let modal = this.showModal(ResponseEditPage,
    //   { deployment: this.deployment,
    //     post: this.post });
    // modal.onDidDismiss(data => {
    //   this.logger.info(this, "editResponse", "Modal", data);
    // });
  }

  putUnderReview(post:Post) {
    this.logger.info(this, "putUnderReview");
    this.showToast('Put Under Review Not Implemented');
  }

  addToCollection(post:Post) {
    this.logger.info(this, "addToCollection");
    this.showToast('Add To Collection Not Implemented');
  }

  archiveResponse(post:Post) {
    this.logger.info(this, "archiveResponse");
    this.showToast('Archive Not Implemented');
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
