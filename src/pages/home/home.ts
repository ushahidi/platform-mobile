import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, TextInput, Button, LoadingController, ModalController } from 'ionic-angular';

import { DeploymentAddPage } from '../deployment-add/deployment-add';
import { DeploymentLoginPage } from '../deployment-login/deployment-login';

import { ApiService } from '../../providers/api-service/api-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [ ApiService ],
  entryComponents:[ DeploymentAddPage, DeploymentLoginPage ]
})
export class HomePage {

  constructor(
    public platform:Platform,
    public api:ApiService,
    public navController:NavController,
    public modalController: ModalController,
    public loadingController:LoadingController) {
  }

  ionViewLoaded() {
    console.log("Home ionViewLoaded");
  }

  ionViewWillEnter() {
    console.log("Home ionViewWillEnter");
  }

  ionViewDidEnter() {
    console.log("Home ionViewDidEnter");
  }

  addDeployment(event) {
    console.log("Home addDeployment");
    let modal = this.modalController.create(
      DeploymentAddPage,
      { });
    modal.present();
    modal.onDidDismiss(data => {
      if (data) {
        console.log(data);
        this.navController.setRoot(DeploymentLoginPage,
         { deployment: data['deployment'] },
         { animate: true,
           direction: 'forward' });
      }
    });
  }

  showMenu(event) {
    console.log("Home showMenu");
  }
}
