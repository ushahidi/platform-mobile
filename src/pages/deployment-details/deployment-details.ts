import { Component } from '@angular/core';
import { Platform, NavParams, NavController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController } from 'ionic-angular';

import { ResponseListPage } from '../response-list/response-list';
import { ResponseAddPage } from '../response-add/response-add';

import { ApiService } from '../../providers/api-service';

@Component({
  selector: 'page-deployment-details',
  templateUrl: 'deployment-details.html',
  providers: [ ApiService ],
  entryComponents:[ ResponseListPage, ResponseAddPage ]
})
export class DeploymentDetailsPage {

  token: string = null;
  deployment: any;
  site: any;
  forms: any;
  offset: number = 1000;
  placeholder: string = "assets/images/placeholder-photo.jpg";

  constructor(
    public platform:Platform,
    public api:ApiService,
    public navParams: NavParams,
    public navController:NavController,
    public toastController: ToastController,
    public alertController: AlertController,
    public modalController: ModalController,
    public loadingController:LoadingController,
    public actionController: ActionSheetController) {}

    ionViewDidLoad() {
      console.log('Deployment Details ionViewDidLoad');
    }

    ionViewWillEnter() {
      console.log("Deployment Details ionViewWillEnter");
      this.token = this.navParams.get('token');
      this.deployment = this.navParams.get("deployment");
      this.deployment.url = `https://${this.deployment.subdomain}.${this.deployment.domain}`;
      if (this.token) {
        this.loadDeployment();
        this.loadForms();
      }
    }

    ionViewDidEnter() {
      console.log(`Deployment Details ionViewDidEnter`);
    }

    showResponses(event) {
      console.log("Deployment Details showResponses");
      this.navController.push(
        ResponseListPage,
        { token: this.token,
          forms: this.forms,
          deployment: this.deployment });
    }

    showCollections(event) {
      console.log("Deployment Details showCollections");
      let toast = this.toastController.create({
        message: 'Collections Not Implemented',
        duration: 1500
      });
      toast.present();
    }

    showSettings(event) {
      console.log("Deployment Details showSettings");
      let toast = this.toastController.create({
        message: 'Settings Not Implemented',
        duration: 1500
      });
      toast.present();
    }

    loadDeployment() {
      this.api.getConfigSite(this.deployment.url, this.token).then(results => {
        console.log(`Site ${results}`);
        this.site = results;
      });
    }

    loadForms() {
      this.api.getFormsWithAttributes(this.deployment.url, this.token).then(results => {
        let forms = <any[]>results;
        console.log(`Forms ${forms}`);
        this.forms = forms;
      });
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

    shareDeployment(event) {
      console.log("Deployment Details shareDeployment");
      let toast = this.toastController.create({
        message: 'Sharing Not Implemented',
        duration: 1500
      });
      toast.present();
    }
}
