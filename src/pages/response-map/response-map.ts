import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-response-map',
  templateUrl: 'response-map.html'
})
export class ResponseMapPage {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    console.log('Hello ResponseMapPage Page');
  }

}
