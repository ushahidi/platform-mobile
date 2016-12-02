import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, TextInput, Button,
        LoadingController, ToastController, AlertController, ViewController } from 'ionic-angular';

import { DeploymentLoginPage } from '../deployment-login/deployment-login';

import { ApiService } from '../../providers/api-service/api-service';

@Component({
  selector: 'page-deployment-add',
  templateUrl: 'deployment-add.html',
  providers: [ ApiService ],
  entryComponents:[ DeploymentLoginPage ]
})
export class DeploymentAddPage {

  deployments: any = [];
  loading: boolean = false;

  constructor(
    public platform:Platform,
    public api:ApiService,
    public navParams: NavParams,
    public navController:NavController,
    public toastController: ToastController,
    public alertController: AlertController,
    public viewController: ViewController,
    public loadingController:LoadingController) {

  }

  ionViewDidLoad() {
    console.log('Deployment Add ionViewDidLoad');
  }

  doCancel(event) {
    console.log("Deployment Add doCancel");
    this.viewController.dismiss();
  }

  searchDeployments(event) {
    console.log(`Deployment Add searchDeployments ${event.target.value}`);
    let search = event.target.value;
    if (search && search.length > 0) {
      this.loading = true;
      this.api.searchDeployments(search).then(results => {
        this.deployments = <any[]>results;
        this.loading = false;
      });
    }
    else {
      this.deployments = [];
    }
  }

  addDeployment(event, deployment) {
    console.log(`Deployment Add addDeployment`);
    let data = { 'deployment' : deployment };
    this.viewController.dismiss(data);
  }

}
