import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-deployments',
  templateUrl: 'deployments.html'
})
export class DeploymentsPage {

  search: any = String;
  deployments: any = [];

  constructor(
    public navController: NavController,
    public navParams: NavParams) {

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
        domain: 'api.ushahididev.com',
        subdomain: 'deployment1',
        deployment_name: "Deployment 1"},
      { tier: 'free',
        status: 'deployed',
        domain: 'api.ushahididev.com',
        subdomain: 'deployment2',
        deployment_name: "Deployment 2"},
      { tier: 'free',
        status: 'deployed',
        domain: 'api.ushahididev.com',
        subdomain: 'deployment3',
        deployment_name: "Deployment 3"}];
  }

}
