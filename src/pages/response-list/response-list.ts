import { Component } from '@angular/core';
import { Platform, NavParams, NavController,
  LoadingController, ToastController, AlertController, ModalController, ActionSheetController } from 'ionic-angular';

import { ResponseAddPage } from '../response-add/response-add';
import { ResponseDetailsPage } from '../response-details/response-details';

import { CardComponent } from '../../components/card/card';

import { ApiService } from '../../providers/api-service';

@Component({
  selector: 'page-response-list',
  templateUrl: 'response-list.html',
  providers: [ ApiService ],
  entryComponents:[ ResponseAddPage, ResponseDetailsPage ]
})
export class ResponseListPage {

  token: string = null;
  deployment: any;
  responses: any;
  forms: any;

  constructor(
    public platform:Platform,
    public api:ApiService,
    public navParams: NavParams,
    public navController:NavController,
    public toastController: ToastController,
    public alertController: AlertController,
    public modalController: ModalController,
    public loadingController:LoadingController,
    public actionController: ActionSheetController) {

  }

  ionViewDidLoad() {
    console.log('Response List ionViewDidLoad');
  }

  ionViewWillEnter() {
    console.log("Response List ionViewWillEnter");
    this.token = this.navParams.get("token");
    this.deployment = this.navParams.get("deployment");
    this.deployment.url = `https://${this.deployment.subdomain}.${this.deployment.domain}`;
    this.forms = this.navParams.get("forms");
    this.loadUpdates(null);
  }

  ionViewDidEnter() {
    console.log("Response List ionViewDidEnter");
  }

  loadUpdates(event) {
    console.log("Response List loadUpdates");
    this.api.getPosts(this.deployment.url, this.token).then(results => {
      let responses = <any[]>results['results'];
      console.log(`Response List Responses ${responses.length}`)
      this.responses = responses;
      if (event) {
        event.complete();
      }
    });
  }

  showResponse(event, response) {
    console.log("Deployment List showResponse");
    this.navController.push(
      ResponseDetailsPage,
      { token: this.token,
        deployment: this.deployment,
        response: response });
  }

  addResponse(event) {
    console.log("Deployment Details addResponse");
    let buttons = [];
    if (this.forms) {
      for (var i = 0; i <= this.forms.length; i++){
        let form = this.forms[i];
        if (form) {
          buttons.push({
            text: form.name,
            handler: () => {
              console.log(`Form ${form.name} Selected`);
              this.showResponseAdd(form);
          }});
        }
      }
    }
    buttons.push({
      text: 'Cancel',
      role: 'cancel'});
    let actionSheet = this.actionController.create({
      title: 'Submit a survey response',
      buttons: buttons
    });
    actionSheet.present();
  }

  showResponseAdd(form) {
    let modal = this.modalController.create(
      ResponseAddPage,
      { token: this.token,
        form: form,
        deployment: this.deployment });
    modal.present();
    modal.onDidDismiss(data => {

    });
  }

  searchResponses(event) {
    console.log("Deployment List searchResponses");
    let toast = this.toastController.create({
      message: 'Search Not Implemented',
      duration: 1500
    });
    toast.present();
  }

  shareResponses(event) {
    console.log("Deployment List shareResponses");
    let toast = this.toastController.create({
      message: 'Sharing Not Implemented',
      duration: 1500
    });
    toast.present();
  }

}
