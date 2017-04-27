import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, Content, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

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
  title:string = "Image";
  placeholder:string = PLACEHOLDER_PHOTO;

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
    protected logger:LoggerService) {
    super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, logger);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.deployment = this.getParameter<Deployment>("deployment");
    this.post = this.getParameter<Post>("post");
    this.image = this.getParameter<string>("image");
    this.title = this.getParameter<string>("title");
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
