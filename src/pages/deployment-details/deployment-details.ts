import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the DeploymentDetails page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-deployment-details',
  templateUrl: 'deployment-details.html'
})
export class DeploymentDetailsPage {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    console.log('Hello DeploymentDetailsPage Page');
  }

}
