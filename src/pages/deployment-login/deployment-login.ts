import { Component, ViewChild } from '@angular/core';
import { Platform, NavParams, NavController, TextInput, Button, LoadingController,
  ToastController, AlertController, ViewController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { DeploymentDetailsPage } from '../deployment-details/deployment-details';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

@Component({
  selector: 'page-deployment-login',
  templateUrl: 'deployment-login.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ DeploymentDetailsPage ]
})
export class DeploymentLoginPage {

  deployment: any;

  @ViewChild('login') login: Button;
  @ViewChild('cancel') cancel: Button;

  @ViewChild('username') username: TextInput;
  @ViewChild('password') password: TextInput;

  constructor(
    public platform:Platform,
    public api:ApiService,
    public database:DatabaseService,
    public navParams: NavParams,
    public navController:NavController,
    public toastController: ToastController,
    public alertController: AlertController,
    public viewController: ViewController,
    public loadingController:LoadingController) {

    }

    ionViewDidLoad() {
      console.log('Deployment Login ionViewDidLoad');
    }

    ionViewWillEnter() {
      console.log("Deployment Login ionViewWillEnter");
      this.platform.ready().then(() => {
        StatusBar.styleLightContent();
        StatusBar.backgroundColorByHexString('#3f4751');
      });
      this.deployment = this.navParams.get("deployment");
      if (this.deployment.username) {
        this.username.value = this.deployment.username;
      }
      else if (this.deployment.subdomain == 'dale') {
        //TODO remove this later, hardcoded to speed up development
        this.username.value = "dalezak@gmail.com";
      }
      if (this.deployment.password) {
        this.password.value = this.deployment.password;
      }
      else if (this.deployment.subdomain == 'dale') {
        //TODO remove this later, hardcoded to speed up development
        this.password.value = "P4NpCNUqLTCnvJAQBBMX";
      }
    }

    ionViewDidEnter() {
      console.log("Deployment Login ionViewDidEnter");
    }

    onCancel(event) {
      console.log("Deployment Login onCancel");
      this.viewController.dismiss();
    }

    onLogin(event) {
      console.log("Deployment Login onLogin");
      let host = this.deployment.url;
      let username = this.username.value.toString();
      let password = this.password.value.toString();
      if (username.length > 0 && password.length > 0) {
        let loading = this.loadingController.create({
          content: "Logging in..."
        });
        loading.present();
        this.api.authLogin(host, username, password).then(
          (tokens) => {
            console.log(`Deployment Login ${JSON.stringify(tokens)}`);
            if (tokens) {
              let changes = {
                access_token: tokens['access_token'],
                refresh_token: tokens['refresh_token'],
                username: username,
                password: password };
              this.database.updateDeployment(this.deployment.id, changes).then(
                (results) => {
                  loading.dismiss();
                  let toast = this.toastController.create({
                    message: 'Login Successful',
                    duration: 1500
                  });
                  toast.present();
                  this.showDeployment(tokens['access_token']);
                },
                (error) => {
                  loading.dismiss();
                  let alert = this.alertController.create({
                    title: 'Problem Updating Deployment',
                    subTitle: JSON.stringify(error),
                    buttons: ['OK']
                  });
                  alert.present();
                });
            }
            else {
              loading.dismiss();
              let alert = this.alertController.create({
                title: 'Invalid Credentials',
                subTitle: 'Please verify your email and password, then try again.',
                buttons: ['OK']
              });
              alert.present();
            }
          },
          (error) => {
            loading.dismiss();
            let alert = this.alertController.create({
              title: 'Invalid Credentials',
              subTitle: 'Please verify your email and password, then try again.',
              buttons: ['OK']
            });
            alert.present();
          });
      }
    }

    showDeployment(token:string) {
      this.navController.setRoot(DeploymentDetailsPage,
       { token: token,
         deployment: this.deployment },
       { animate:true,
         direction: 'forward' });
    }

    showMenu(event) {
      console.log("Deployment Login showMenu");
    }

}
