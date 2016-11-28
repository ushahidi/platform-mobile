import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, TextInput, Button, LoadingController,
  ToastController, AlertController, ViewController } from 'ionic-angular';

import { ApiService } from '../../providers/api-service/api-service';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers: [ ApiService ]
})
export class LoginPage {

  deployment: any;

  @ViewChild('cancel') cancel: Button;
  @ViewChild('login') login: Button;

  @ViewChild('username') username: TextInput;
  @ViewChild('password') password: TextInput;

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
      console.log('Login ionViewDidLoad');
    }

    ionViewWillEnter() {
      console.log("Login ionViewWillEnter");
      this.deployment = this.navParams.get("deployment");
      this.deployment.url = `https://${this.deployment.subdomain}.${this.deployment.domain}`;
      if (this.deployment.subdomain == 'dale') {
        this.username.value = "dalezak@gmail.com";
        this.password.value = "P4NpCNUqLTCnvJAQBBMX";
      }
    }

    ionViewDidEnter() {
      console.log("Login ionViewDidEnter");
    }

    doCancel(event) {
      console.log("Login doCancel");
      this.viewController.dismiss();
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
          if (token && token.length > 0) {
            let toast = this.toastController.create({
              message: 'Login Successful',
              duration: 3000
            });
            toast.present();
            this.viewController.dismiss({token: token.toString()});
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
