import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, TextInput, Button,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController  } from 'ionic-angular';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';
import { ResponseMapPage } from '../../pages/response-map/response-map';

@Component({
  selector: 'page-response-edit',
  templateUrl: 'response-edit.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ ResponseMapPage ]
})
export class ResponseEditPage extends BasePage {

  color: string = "#cccccc";
  deployment: any;
  form: any;
  attributes: any;
  response:any = null;

  @ViewChild('submit') submit: Button;

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
    this.response = this.navParams.get("response");
    this.form = this.navParams.get("form");
    this.attributes = this.navParams.get("attributes");
    this.color = this.form.color;
  }

  ionViewDidEnter() {
    this.logger.info(this, "ionViewDidEnter");
  }

  onCancel(event) {
    this.logger.info(this, "onCancel");
    this.viewController.dismiss();
  }

  changeLocation(event) {
    this.logger.info(this, "changeLocation", event);
    let modal = this.showModal(ResponseMapPage,
      { latitude: event['latitude'],
        longitude: event['longitude'] },
      { showBackdrop: false,
        enableBackdropDismiss: false });
    modal.onDidDismiss(data => {
      this.logger.info(this, "changeLocation", "Modal", data);
    });
  }

  updateResponse(event) {
    this.logger.info(this, "updateResponse");
    let host = this.deployment.url;
    let id = this.response.id;
    let title = "";
    let content = "";
    let loading = this.loadingController.create({
      content: "Updating..."
    });
    loading.present();
    // this.api.updatePost(host, token, id, title, content).then(resp => {
    //   this.logger.info(this, `${resp}`);
    //   loading.dismiss();
    //   if (resp) {
    //     this.updateResponseSucceeded();
    //   }
    //   else {
    //     this.updateResponseFailed();
    //   }
    // });
  }

  updateResponseFailed() {
    this.showAlert('Update Failed', 'There was a problem updating the response.');
  }

  updateResponseSucceeded() {
    let buttons = [{
      text: 'Ok',
      role: 'cancel',
      handler: () => {
        this.viewController.dismiss();
      }
    }];
    this.showAlert('Update Successful', 'Your response has been updated!', buttons);
  }

}
