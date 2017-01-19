import { Component } from '@angular/core';
import {
  Alert, AlertController,
  Toast, ToastController,
  Modal, ModalController,
  Loading, LoadingController,
  ActionSheet, ActionSheetController,
  NavController, ViewController } from 'ionic-angular';
import { SocialSharing } from 'ionic-native';

export class BasePage {

  constructor(
    protected navController:NavController,
    protected viewController:ViewController,
    protected modalController:ModalController,
    protected toastController:ToastController,
    protected alertController:AlertController,
    protected loadingController:LoadingController,
    protected actionController:ActionSheetController) {

  }

  showLoading(message:string):Loading {
    let loading = this.loadingController.create({
      content: message
    });
    loading.present();
    return loading;
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

  showToast(message:string, duration:number=1500):Toast {
    let toast = this.toastController.create({
      message: message,
      duration: duration
    });
    toast.present();
    return toast;
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

  showShare(subject:string, message:string=null, file:string=null, url:string=null) {
    return SocialSharing.share(message, subject, file, url);
  }

}
