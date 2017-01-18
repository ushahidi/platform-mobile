import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, Button,
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
    public navParams: NavParams,
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
      //Ignore If Post Values Have Already Been Loaded
    }
    else {
      return this.database.getValues(this.deployment, this.post).then(
        (results) => {
          this.post.values = <any[]>results;
          this.logger.info(this, "loadValues", "Database", this.post.values);
        },
        (error) => {
          this.logger.error(this, "loadValues", "Database", error);
        });
    }
  }

  shareResponse(event:any) {
    this.logger.info(this, "shareResponse");
    this.showToast('Sharing Not Implemented');
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

}
