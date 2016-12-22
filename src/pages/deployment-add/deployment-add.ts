import { Component } from '@angular/core';
import { Platform, NavParams, NavController, LoadingController, ToastController, AlertController, ViewController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { DeploymentLoginPage } from '../deployment-login/deployment-login';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

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
    public database:DatabaseService,
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

  ionViewWillEnter() {
    console.log("Deployment Add ionViewWillEnter");
    this.platform.ready().then(() => {
      StatusBar.styleLightContent();
      StatusBar.backgroundColorByHexString('#3f4751');
    });
  }

  onCancel(event) {
    console.log("Deployment Add onCancel");
    this.viewController.dismiss();
  }

  searchDeployments(event) {
    console.log(`Deployment Add searchDeployments ${event.target.value}`);
    let search = event.target.value;
    if (search && search.length > 0) {
      this.loading = true;
      this.api.searchDeployments(search).then(
        (results) => {
          this.deployments = <any[]>results;
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          let toast = this.toastController.create({
            message: error,
            duration: 1500
          });
          toast.present();
        });
    }
    else {
      this.deployments = [];
    }
  }

  addDeployment(event, deployment) {
    console.log(`Deployment Add addDeployment`);
    let loading = this.showLoading("Adding...");
    this.database.getDeploymentBySubdomain(deployment.subdomain).then(results => {
      let deployments = <any[]>results;
      if (deployments && deployments.length > 0) {
        loading.dismiss();
        this.showAlert('Deployment Already Added', 'Looks like that deployment has already been added.');
      }
      else {
        this.database.addDeployment(deployment).then(
          (results) => {
            console.log(`Deployment Add addDeployment ID ${results}`);
            loading.dismiss();
            if (results) {
              deployment['id'] = results;
              let data = { 'deployment' : deployment };
              this.viewController.dismiss(data);
            }
            else {
              this.showAlert('Problem Adding Deployment', 'There was a problem adding your deployment.');
            }
          },
          (error) => {
            console.error(`Deployment Add addDeployment ${error}`);
            loading.dismiss();
            this.showAlert('Problem Adding Deployment', error);
          });
      }
    });
  }

  showLoading(message) {
    let loading = this.loadingController.create({
      content: message
    });
    loading.present();
    return loading;
  }

  showAlert(title, subTitle) {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: ['OK']
    });
    alert.present();
    return alert;
  }

  showToast(message, duration:number=1500) {
    let toast = this.toastController.create({
      message: message,
      duration: duration
    });
    toast.present();
    return toast;
  }

}
