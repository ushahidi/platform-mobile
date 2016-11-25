import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { LoginPage } from '../login/login';

import { ApiService } from '../../providers/api-service/api-service';

@Component({
  selector: 'page-deployment-list',
  templateUrl: 'deployment-list.html',
  providers: [ ApiService ],
  entryComponents:[ LoginPage ]
})
export class DeploymentListPage {

  search: any = String;
  deployments: any = [];

  constructor(
    public navController: NavController,
    public navParams: NavParams,
    public api:ApiService) {

    }

  ionViewDidLoad() {
    console.log('Deployments ionViewDidLoad');
  }

  ionViewWillEnter() {
    console.log("Deployments ionViewWillEnter");
    this.search = this.navParams.get("search");
    this.deployments = this.navParams.get("deployments");
  }

  ionViewDidEnter() {
    console.log("Deployments ionViewDidEnter");
    this.deployments = [
      { tier: 'free',
        status: 'deployed',
        domain: 'api.ushahidi.io',
        subdomain: 'dale',
        deployment_name: "Dale",
        url: "https://dale.api.ushahidi.io"},
      { tier: 'free',
        status: 'deployed',
        domain: 'api.ushahididev.com',
        subdomain: 'ansibletest',
        deployment_name: "Robbie",
        url: "https://ansibletest.api.ushahididev.com"},
      { tier: 'free',
        status: 'deployed',
        domain: 'api.ushahididev.com',
        subdomain: 'angie',
        deployment_name: "Angie QA",
        url: "https://angie.api.ushahididev.com"}];
  }

  showDeployment($event, deployment) {
    console.log(`Home showDeployment ${deployment}`);
    this.navController.push(
      LoginPage,
      { deployment: deployment });
  }

}
