import { Component, ViewChild, NgZone } from '@angular/core';
import {
  Content, Platform,
  Alert, AlertController,
  Toast, ToastController,
  Modal, ModalController,
  Loading, LoadingController,
  ActionSheet, ActionSheetController,
  NavController, ViewController } from 'ionic-angular';
import { SocialSharing, Network } from 'ionic-native';

export class BasePage {

  zone: NgZone = null;
  offline: boolean = false;
  connection: any = null;
  disconnection: any = null;

  @ViewChild(Content)
  content: Content;

  constructor(
    zone: NgZone,
    protected platform:Platform,
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
  }

  ionViewWillEnter() {
    this.connection = Network.onConnect().subscribe(() => {
      console.log(`Network Connected ${Network.connection}`);
      this.zone.run(() => {
        this.offline = false;
        this.resizeContent();
      });
      this.networkConnected(Network.connection);
    });
    this.disconnection = Network.onDisconnect().subscribe(() => {
      console.log(`Network Disconnected`);
      this.zone.run(() => {
        this.offline = true;
        this.resizeContent();
      });
      this.networkDisconnected();
    });
  }

  ionViewDidEnter() {
  }

  ionViewWillLeave() {
    if (this.connection) {
      this.connection.unsubscribe();
    }
    if (this.disconnection) {
      this.disconnection.unsubscribe();
    }
  }

  ionViewDidLeave() {
  }

  ionViewWillUnload() {
  }

  networkConnected(type:string) {
  }

  networkDisconnected() {
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

  resizeContent(delay:number=100) {
    setTimeout(() => {
      this.content.resize();
    }, delay);
  }

  showOfflineAlert() {
    this.showAlert("Internet Offline", "There currently is no internet connection available.")
  }

}
