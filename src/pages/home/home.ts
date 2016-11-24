import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, TextInput, Button, LoadingController } from 'ionic-angular';

import { DeploymentsPage } from '../deployments/deployments';

import { ApiService } from '../../providers/api-service/api-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [ApiService],
  entryComponents:[ DeploymentsPage ]
})
export class HomePage {

  @ViewChild('input') input: TextInput;
  @ViewChild('button') button: Button;

  constructor(
    public platform:Platform,
    public api:ApiService,
    public navController:NavController,
    public loadingController:LoadingController) {
  }

  ionViewLoaded() {
    console.log("Home ionViewLoaded");
  }

  ionViewWillEnter() {
    console.log("Home ionViewWillEnter");
    this.input.value = "";
  }

  ionViewDidEnter() {
    console.log("Home ionViewDidEnter");
  }

  inputFocussed(event) {
    console.log("Home inputFocussed");
  }

  inputBlurred(event) {
    console.log("Home inputBlurred");
  }

  searchDeployments(event) {
    console.log(`Home searchDeployments ${this.input.value}`);
    let search = this.input.value.toString();
    if (search && search.length > 0) {
      let loading = this.loadingController.create({
        content: "Searching..."
      });
      loading.present();
      this.api.searchDeployments(search).then(deployments => {
        console.log(JSON.stringify(deployments));
        loading.dismiss();
        this.navController.push(
          DeploymentsPage,
          { search: search,
            deployments: deployments });
      });
    }
  }

}
