import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the ResponseList page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-response-list',
  templateUrl: 'response-list.html'
})
export class ResponseListPage {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    console.log('Hello ResponseListPage Page');
  }

}
