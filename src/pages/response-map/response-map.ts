import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the ResponseMap page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
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
