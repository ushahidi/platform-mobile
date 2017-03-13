import { Component, ViewChild, NgZone } from '@angular/core';
import {
  Content, Platform, NavParams,
  Alert, AlertController,
  Toast, ToastController,
  Modal, ModalController,
  Loading, LoadingController,
  ActionSheet, ActionSheetController,
  NavController, ViewController } from 'ionic-angular';
import { InAppBrowser, SocialSharing, Network, IsDebug } from 'ionic-native';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'base-page',
  templateUrl: 'base-page.html',
  providers: [ LoggerService ],
})
export class BasePage {

  zone: NgZone = null;
  debug: boolean = true;
  offline: boolean = false;
  connection: any = null;
  disconnection: any = null;

  @ViewChild(Content)
  content: Content;

  constructor(
    zone: NgZone,
    protected platform:Platform,
    protected logger:LoggerService,
    protected navParams: NavParams,
    protected navController:NavController,
    protected viewController:ViewController,
    protected modalController:ModalController,
    protected toastController:ToastController,
    protected alertController:AlertController,
    protected loadingController:LoadingController,
    protected actionController:ActionSheetController) {
    this.zone = zone;
  }

  ionViewDidLoad() {
    this.logger.info(this, "ionViewDidLoad");
    this.platform.ready().then(() => {
      IsDebug.getIsDebug().then((isDebug:boolean) => {
        this.debug = isDebug;
      });
    });
  }

  ionViewWillEnter() {
    this.logger.info(this, "ionViewWillEnter", "Network", Network.type);
    if (Network.type == 'none') {
      this.zone.run(() => {
        this.offline = true;
        this.resizeContent();
      });
    }
    else {
      this.zone.run(() => {
        this.offline = false;
      });
    }
    this.connection = Network.onConnect().subscribe(() => {
      this.logger.info(this, "Network Connected", Network.type);
      this.zone.run(() => {
        this.offline = false;
        this.resizeContent();
      });
    });
    this.disconnection = Network.onDisconnect().subscribe(() => {
      this.logger.info(this, "Network Disconnected", Network.type);
      this.zone.run(() => {
        this.offline = true;
        this.resizeContent();
      });
    });
  }

  ionViewDidEnter() {
    this.logger.info(this, "ionViewDidEnter");
  }

  ionViewWillLeave() {
    this.logger.info(this, "ionViewWillLeave");
    if (this.connection) {
      this.connection.unsubscribe();
    }
    if (this.disconnection) {
      this.disconnection.unsubscribe();
    }
  }

  ionViewDidLeave() {
    this.logger.info(this, "ionViewDidLeave");
  }

  ionViewWillUnload() {
    this.logger.info(this, "ionViewWillUnload");
  }

  getParameter<T extends Object>(param:string):T {
    return <T>this.navParams.get(param);
  }

  showLoading(message:string):Loading {
    let loading = this.loadingController.create({
      content: message
    });
    loading.present();
    return loading;
  }

  showToast(message:string, duration:number=1500):Toast {
    let toast = this.toastController.create({
      message: message,
      duration: duration
    });
    toast.present();
    return toast;
  }

  showAlert(title:string, subTitle:string, buttons:any=['OK']):Alert {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: buttons
    });
    alert.present();
    return alert;
  }

  showConfirm(title:string, subTitle:string, buttons:any=['OK']):Alert {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: buttons
    });
    alert.present();
    return alert;
  }

  showActionSheet(title:string, buttons:any):ActionSheet {
    let actionSheet = this.actionController.create({
      title: title,
      buttons: buttons
    });
    actionSheet.present();
    return actionSheet;
  }

  showModal(page:any, params:any={}, options:any={}):Modal {
    let modal = this.modalController.create(page, params, options);
    modal.present();
    return modal;
  }

  hideModal(data:any=null) {
    this.viewController.dismiss(data);
  }

  showPage(page:any, params:any={}, options:any={}) {
    this.navController.push(page, params, options);
  }

  showRootPage(page:any, params:any={}, options:any={}) {
    this.navController.setRoot(page, params, options);
  }

  closePage(data:any=null) {
    this.viewController.dismiss(data);
  }

  showShare(subject:string, message:string=null, file:string=null, url:string=null) {
    return SocialSharing.share(message, subject, file, url);
  }

  showUrl(url:string, target:string="_system"):InAppBrowser {
    this.logger.info(this, "showUrl", url, target);
    let browser = new InAppBrowser(url, target);
    browser.show();
    return browser;
  }

  showOfflineAlert() {
    this.showAlert("Internet Offline", "There currently is no internet connection available.")
  }

  resizeContent(delay:number=100) {
    setTimeout(() => {
      if (this.content) {
        this.logger.info(this, "resizeContent");
        this.content.resize();
      }
      else {
        this.logger.error(this, "resizeContent", "NULL");
      }
    }, delay);
  }

  runSequentially(tasks):Promise<any> {
    var result = Promise.resolve();
    tasks.forEach(task => {
      result = result.then(() => task());
    });
    return result;
  }

}
