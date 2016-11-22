import { Component } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';

import { ApiService } from '../../providers/api-service/api-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [ApiService]
})
export class HomePage {

  constructor(
    public platform:Platform,
    public navCtrl:NavController,
    public api:ApiService) {

  }

  ionViewLoaded() {
    console.log("Home ionViewLoaded");
  }

  ionViewWillEnter() {
    console.log("Home ionViewWillEnter");
  }

  ionViewDidEnter() {
    console.log("Home ionViewDidEnter");
    this.api.postLogin("dalezak@gmail.com", "P4NpCNUqLTCnvJAQBBMX");
  }
}
