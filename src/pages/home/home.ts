import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {

  }

  ionViewLoaded() {
    console.log("Home.ionViewLoaded");
  }

  ionViewWillEnter() {
    console.log("Home.ionViewWillEnter");
  }

  ionViewDidEnter() {
    console.log("Home.ionViewDidEnter");
  }
}
