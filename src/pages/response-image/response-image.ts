import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, NavParams, Content,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController  } from 'ionic-angular';

import { BasePage } from '../../pages/base-page/base-page';

import { Deployment } from '../../models/deployment';
import { Post } from '../../models/post';

import { LoggerService } from '../../providers/logger-service';

import { PLACEHOLDER_PHOTO } from '../../constants/placeholders';

@Component({
  selector: 'page-response-image',
  templateUrl: 'response-image.html'
})
export class ResponseImagePage extends BasePage {

  @ViewChild(Content)
  content: Content;

  deployment:Deployment = null;
  post:Post = null;
  image:string = null;
  placeholder:string = PLACEHOLDER_PHOTO;

  constructor(
    public logger:LoggerService,
    public navParams: NavParams,
    public zone: NgZone,
    public platform:Platform,
    public navController:NavController,
    public viewController:ViewController,
    public modalController:ModalController,
    public toastController:ToastController,
    public alertController:AlertController,
    public loadingController:LoadingController,
    public actionController:ActionSheetController) {
      super(zone, platform, logger, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.deployment = this.getParameter<Deployment>("deployment");
    this.post = this.getParameter<Post>("post");
    this.image = this.getParameter<string>("image");
    this.logger.info(this, 'ionViewWillEnter', this.image);
  }

  shareImage(event:any) {
    let subject = this.deployment.name;
    let message = this.post.title;
    let file = this.image;
    let url = this.post.url;
    this.logger.info(this, "shareImage", "Subject", subject, "Message", message, "File", file, "URL", url);
    this.showShare(subject, message, file, url).then(
      (shared) => {
        if (shared) {
          this.showToast("Image Shared");
          this.trackEvent("Images", "shared", this.image);
        }
      },
      (error) => {
        this.showToast(error);
    });
  }

}
