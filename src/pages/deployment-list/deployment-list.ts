import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { DeploymentLoginPage } from '../deployment-login/deployment-login';

import { ApiService } from '../../providers/api-service/api-service';

@Component({
  selector: 'page-deployment-list',
  templateUrl: 'deployment-list.html',
  providers: [ ApiService ],
  entryComponents:[ DeploymentLoginPage ]
})
export class DeploymentListPage {

  search: string = null;
  deployments: any = [];

  constructor(
    public navController: NavController,
    public navParams: NavParams,
    public api:ApiService) {

  }

  ionViewDidLoad() {
    console.log('Deployment List ionViewDidLoad');
  }

  ionViewWillEnter() {
    console.log("Deployment List ionViewWillEnter");
    this.search = this.navParams.get("search");
    this.deployments = this.navParams.get("deployments");
  }

  ionViewDidEnter() {
    console.log("Deployment List ionViewDidEnter");
  }

  showDeployment($event, deployment) {
    console.log(`Deployment List showDeployment ${deployment}`);
    this.navController.push(
      DeploymentLoginPage,
      { deployment: deployment });
  }

}
