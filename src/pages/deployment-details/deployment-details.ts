import { Component } from '@angular/core';
import { Platform, NavParams, NavController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { DeploymentLoginPage } from '../deployment-login/deployment-login';

import { ResponseListPage } from '../response-list/response-list';
import { ResponseAddPage } from '../response-add/response-add';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

@Component({
  selector: 'page-deployment-details',
  templateUrl: 'deployment-details.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ ResponseListPage, ResponseAddPage ]
})
export class DeploymentDetailsPage {

  token: string = null;
  deployment: any;
  forms: any;
  attributes: any;
  offset: number = 1000;
  placeholder: string = "assets/images/placeholder-photo.jpg";
  user: {} = null;

  constructor(
    public platform:Platform,
    public api:ApiService,
    public database:DatabaseService,
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
      this.platform.ready().then(() => {
        StatusBar.styleLightContent();
        StatusBar.backgroundColorByHexString('#3f4751');
      });
      this.token = this.navParams.get('token');
      this.deployment = this.navParams.get("deployment");
      this.loadUpdates(null, true);
    }

    ionViewDidEnter() {
      console.log(`Deployment Details ionViewDidEnter`);
    }

    loadUpdates(event:any=null, cache:boolean=false) {
      console.log("Response Details loadUpdates");
      let promises = [
        this.loadUser(cache),
        this.loadDeployment(cache),
        this.loadForms(cache),
        this.loadAttributes(cache)];
      Promise.all(promises).then(done => {
        if (event) {
          event.complete();
        }
      });
    }

    loadUser(cache:boolean=true) {
      return this.api.getUser(this.deployment.url, this.token).then(
        (results) => {
          console.log(`Deployment Details User ${JSON.stringify(results)}`);
          this.user = results;
          this.database.addUser(this.deployment, this.user).then(results => {
            console.log(`Deployment Details Update User ${JSON.stringify(results)}`);
          });
        },
        (error) => {
          console.error(`Deployment Details User ${error}`);
        });
    }

    loadDeployment(cache:boolean=true) {
      console.log(`Deployment Details loadDeployment ${cache?'CACHED':'REFRESH'}`);
      if (cache && this.deployment.image != null && this.deployment.description != null) {
        return this.database.getDeployment(this.deployment.id).then(results => {
          console.log(`Deployment Details Deployment ${JSON.stringify(results)}`);
          this.deployment = results[0];
        });
      }
      else {
        return this.api.getDeployment(this.deployment.url, this.token).then(results => {
          console.log(`Deployment Details Site ${JSON.stringify(results)}`);
          this.deployment.image = results['image_header'];
          this.deployment.description = results['description'];
          let changes = {
            image: results['image_header'],
            description: results['description'] };
          this.database.updateDeployment(this.deployment.id, changes).then(
            (results) => {
              console.log(`Deployment Details Update Deployment ${results}`);
            },
            (error) => {
              console.error(`Deployment Details Update Deployment ${error}`);
            });
        });
      }
    }

    loadForms(cache:boolean=true) {
      console.log(`Deployment Details loadForms ${cache?'CACHED':'REFRESH'}`);
      if (cache && this.forms) {
        return this.database.getForms(this.deployment.id).then(results => {
          console.log(`Deployment Details Forms ${JSON.stringify(results)}`);
          this.forms = <any[]>results;
        });
      }
      else {
        return this.api.getForms(this.deployment.url, this.token).then(
          (results) => {
            let forms = <any[]>results;
            console.log(`Deployment Details Forms ${JSON.stringify(forms)}`);
            for (var i = 0; i < forms.length; i++){
              let form = forms[i];
              this.database.addForm(this.deployment.id, form);
            }
            this.forms = forms;
          },
          (error) => {
            console.error(`Deployment Details Forms ${JSON.stringify(error)}`);
          });
      }
    }

    loadAttributes(cache:boolean=true) {
      console.log(`Deployment Details loadAttributes ${cache?'CACHED':'REFRESH'}`);
      if (cache && this.attributes) {
        // return this.database.getAttributes(this.deployment.id).then(results => {
        //   console.log(`Deployment Details Forms ${JSON.stringify(results)}`);
        //   this.forms = <any[]>results;
        // });
      }
      else {
        return this.api.getAttributes(this.deployment.url, this.token).then(
          (results) => {
            let attributes = <any[]>results;
            console.log(`Deployment Details Attributes ${JSON.stringify(attributes)}`);
            for (var i = 0; i < attributes.length; i++){
              let attribute = attributes[i];
              this.database.addAttribute(this.deployment.id, attribute);
            }
            this.attributes = attributes;
          },
          (error) => {
            console.error(`Deployment Details Attributes ${JSON.stringify(error)}`);
          });
      }
    }

    showResponses(event) {
      console.log("Deployment Details showResponses");
      this.navController.push(
        ResponseListPage,
        { token: this.token,
          forms: this.forms,
          attributes: this.attributes,
          deployment: this.deployment });
    }

    showCollections(event) {
      console.log("Deployment Details showCollections");
      this.showToast('Collections Not Implemented');
    }

    showSettings(event) {
      console.log("Deployment Details showSettings");
      this.showToast('Settings Not Implemented');
    }

    addResponse(event) {
      console.log("Deployment Details addResponse");
      let buttons = [];
      if (this.forms) {
        for (var i = 0; i < this.forms.length; i++){
          let form = this.forms[i];
          buttons.push({
            text: form.name,
            handler: () => {
              console.log(`Deployment Details Form ${form.name} Selected`);
              this.showResponseAdd(form);
          }});
        }
      }
      buttons.push({
        text: 'Cancel',
        role: 'cancel' });
      let actionSheet = this.actionController.create({
        title: 'Submit a survey response',
        buttons: buttons
      });
      actionSheet.present();
    }

    showResponseAdd(form) {
      console.log(`Response Details showResponseAdd Form ${JSON.stringify(form)}`);
      this.database.getAttributes(this.deployment.id, form.id).then(results => {
        console.log(`Response Details showResponseAdd Attributes ${JSON.stringify(results)}`);
        let attributes = <any[]>results;
        let modal = this.modalController.create(
          ResponseAddPage,
          { token: this.token,
            form: form,
            attributes: attributes,
            deployment: this.deployment });
        modal.present();
        modal.onDidDismiss(data => {
          console.log(`Response Details Modal ${JSON.stringify(data)}`);
        });
      });
    }

    shareDeployment(event) {
      console.log("Deployment Details shareDeployment");
      this.showToast('Sharing Not Implemented');
    }

    onLogout(event) {
      console.log("Deployment Details onLogout");
      let loading = this.showLoading("Logging out...");
      let changes = {
        access_token: "",
        refresh_token: "",
        username: "",
        password: "" };
      this.database.updateDeployment(this.deployment.id, changes).then(
        (results) => {
          loading.dismiss();
          this.showToast('Logout Successful');
          this.navController.setRoot(DeploymentLoginPage,
           { deployment: this.deployment },
           { });
        },
        (error) => {
          loading.dismiss();
          this.showAlert('Problem Logging Out', error);
        });
    }

    showLoading(message) {
      let loading = this.loadingController.create({
        content: message
      });
      loading.present();
      return loading;
    }

    showAlert(title, subTitle) {
      let alert = this.alertController.create({
        title: title,
        subTitle: subTitle,
        buttons: ['OK']
      });
      alert.present();
      return alert;
    }

    showToast(message, duration:number=1500) {
      let toast = this.toastController.create({
        message: message,
        duration: duration
      });
      toast.present();
      return toast;
    }

}
