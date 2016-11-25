import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, TextInput, Button, LoadingController, ToastController, AlertController } from 'ionic-angular';

import { DeploymentDetailsPage } from '../deployment-details/deployment-details';

import { ApiService } from '../../providers/api-service/api-service';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  entryComponents:[ LoginPage ]
})
export class LoginPage {

  deployment: any;

  @ViewChild('username') username: TextInput;
  @ViewChild('password') password: TextInput;

  constructor(
    public platform:Platform,
    public api:ApiService,
    public navParams: NavParams,
    public navController:NavController,
    public toastController: ToastController,
    public alertController: AlertController,
    public loadingController:LoadingController) {

    }

    ionViewDidLoad() {
      console.log('Login ionViewDidLoad');
    }

    ionViewWillEnter() {
      console.log("Login ionViewWillEnter");
      this.deployment = this.navParams.get("deployment");
      if (this.deployment.subdomain == 'dale') {
        this.username.value = "dalezak@gmail.com";
        this.password.value = "P4NpCNUqLTCnvJAQBBMX";
      }
    }

    ionViewDidEnter() {
      console.log("Login ionViewDidEnter");
    }

    doLogin(event) {
      console.log("Login doLogin");
      let host = this.deployment.url;
      let username = this.username.value.toString();
      let password = this.password.value.toString();
      if (username.length > 0 && password.length > 0) {
        let loading = this.loadingController.create({
          content: "Logging in..."
        });
        loading.present();
        this.api.postLogin(host, username, password).then(token => {
          console.log(`Login Token ${token}`);
          loading.dismiss();
          if (token) {
            let toast = this.toastController.create({
              message: 'Login Successful',
              duration: 3000
            });
            toast.present();
          }
          else {
            let alert = this.alertController.create({
              title: 'Invalid Credentials',
              subTitle: 'Please verify your email and password, then try again.',
              buttons: ['OK']
            });
            alert.present();
          }
        });
      }
    }

}
