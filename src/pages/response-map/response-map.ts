import { Component } from '@angular/core';
import { Platform, NavParams, NavController,
  LoadingController, ToastController, AlertController, ModalController, ActionSheetController } from 'ionic-angular';

import { ResponseAddPage } from '../response-add/response-add';
import { ResponseDetailsPage } from '../response-details/response-details';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

@Component({
  selector: 'page-response-map',
  templateUrl: 'response-map.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ ResponseAddPage, ResponseDetailsPage ]
})
export class ResponseMapPage {

  token: string = null;
  deployment: any;
  responses: any;
  forms: any;

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
    public actionController: ActionSheetController) {

    }

  ionViewDidLoad() {
    console.log('Hello ResponseMapPage Page');
  }

  ionViewWillEnter() {
    console.log("Response List ionViewWillEnter");
    this.token = this.navParams.get("token");
    this.deployment = this.navParams.get("deployment");
    this.forms = this.navParams.get("forms");
    this.loadPosts(true);
  }

  ionViewDidEnter() {
    console.log("Response List ionViewDidEnter");
  }

  loadPosts(cache:boolean=true, event:any=null) {
    console.log(`Response List loadPosts Cache ${cache}`);
    if (cache) {
      this.database.getPosts(this.deployment.id).then(results => {
        let responses = <any[]>results;
        if (responses && responses.length > 0) {
          console.log(`Response List loadPosts Database ${responses.length}`);
          this.responses = responses;
        }
        else {
          this.loadPosts(false, event);
        }
      });
    }
    else {
      this.api.getPosts(this.deployment.url, this.token).then(results => {
        let responses = <any[]>results['results'];
        console.log(`Response List loadPosts API ${responses.length}`)
        this.responses = responses;
        for (let index in responses) {
          let response = responses[index];
          this.database.addPost(this.deployment.id, response);
        }
        if (event) {
          event.complete();
        }
      });
    }
  }

}
