import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, Button, LoadingController,
  ToastController, AlertController, ViewController, ModalController } from 'ionic-angular';

import { ResponseEditPage } from '../response-edit/response-edit';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

@Component({
  selector: 'page-response-details',
  templateUrl: 'response-details.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ ResponseEditPage ]
})
export class ResponseDetailsPage {

  color: string = "#cccccc";
  token: string = null;
  deployment: any;
  response: any;
  form: any;
  user: any;
  userName: string;
  userPhoto: string;
  userPlaceholder: string = "assets/images/placeholder-user.jpg";
  media: any;
  attributes: any = [];
  values: any;

  @ViewChild('submit') submit: Button;

  constructor(
    public platform:Platform,
    public api:ApiService,
    public database:DatabaseService,
    public navParams: NavParams,
    public navController:NavController,
    public toastController: ToastController,
    public alertController: AlertController,
    public viewController: ViewController,
    public modalController: ModalController,
    public loadingController:LoadingController) {

  }

  ionViewDidLoad() {
    console.log('Response Details ionViewDidLoad');
  }

  ionViewWillEnter() {
    console.log("Response Details ionViewWillEnter");
    this.token = this.navParams.get("token");
    this.deployment = this.navParams.get("deployment");
    this.response = this.navParams.get("response");
    this.form = this.navParams.get("form");
    this.user = this.navParams.get("user");
    this.media = this.navParams.get("media");
    this.color = this.response.color;
    this.loadUser();
    this.loadUpdates(null, true);
  }

  ionViewDidEnter() {
    console.log("Response Details ionViewDidEnter");
  }

  loadUser() {
    if (this.user) {
      if (this.user['gravatar']) {
        this.userPhoto = `https://www.gravatar.com/avatar/${this.user['gravatar']}.jpg?s=32`;
      }
      else {
        this.userPhoto = null;
      }
      if (this.user['realname']) {
        this.userName = this.user['realname'];
      }
    }
    else {
      this.userName = "Anonymous";
    }
  }

  loadUpdates(event, cache:boolean=true) {
    console.log("Response Details loadUpdates");
    let promises = [
      this.loadForm(cache),
      this.loadAttributes(cache),
      this.loadValues(cache)];
    Promise.all(promises).then(
      (done) => {
        console.log(`Response Details loadUpdates DONE`);
        if (event) {
          event.complete();
        }
      },
      (error) => {
        console.error(`Response Details loadUpdates ${JSON.stringify(error)}`);
        if (event) {
          event.complete();
        }
      });
  }

  loadForm(cache:boolean=true) {
    console.log(`Response Details loadForm Cache ${cache}`);
    return this.database.getForm(this.deployment.id, this.response.form).then(results => {
      console.log(`Response Details Form ${JSON.stringify(results)}`);
      this.form = results;
    });
  }

  loadAttributes(cache:boolean=true) {
    console.log(`Response Details loadAttributes Cache ${cache}`);
    return this.database.getAttributes(this.deployment.id, this.response.form).then(results => {
      let attributes = <any[]>results;
      console.log(`Response Details loadAttributes Database ${attributes.length}`);
      this.attributes = attributes;
    });
  }

  loadValues(cache:boolean=true) {
    console.log(`Response Details loadValues Cache ${cache}`);
    return this.database.getValues(this.deployment.id, this.response.id).then(results => {
      let values = <any[]>results;
      console.log(`Response Details loadValues Database ${JSON.stringify(values)}`);
      this.values = {};
      for (let index in values) {
        let value = values[index];
        this.values[value.key] = value;
      }
    });
  }

  shareResponse(event) {
    console.log("Response Details shareResponse");
    let toast = this.toastController.create({
      message: 'Sharing Not Implemented',
      duration: 1500
    });
    toast.present();
  }

  editResponse(event) {
    console.log("Response Details editResponse");
    let modal = this.modalController.create(
      ResponseEditPage,
      { token: this.token,
        deployment: this.deployment,
        form: this.form,
        response: this.response });
    modal.present();
    modal.onDidDismiss(data => {
      console.log("Response Details editResponse Done");
    });
  }

}
