import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, NavParams, Content,
  NavController, ViewController, ModalController, LoadingController, ToastController, AlertController, ActionSheetController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';

import { Deployment } from '../../models/deployment';

import { ApiService } from '../../providers/api-service';
import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { BasePage } from '../../pages/base-page/base-page';
import { DeploymentSearchPage } from '../../pages/deployment-search/deployment-search';
import { DeploymentDetailsPage } from '../../pages/deployment-details/deployment-details';

@Component({
  selector: 'home-page',
  templateUrl: 'home.html',
  providers: [ ApiService, DatabaseService, LoggerService ],
  entryComponents:[ DeploymentSearchPage, DeploymentDetailsPage ]
})
export class HomePage extends BasePage {

  constructor(
    public statusBar:StatusBar,
    public api:ApiService,
    public logger:LoggerService,
    public database:DatabaseService,
    public navParams: NavParams,
    public zone: NgZone,
    public platform:Platform,
    public navController:NavController,
    public viewController:ViewController,
    public modalController:ModalController,
    public toastController:ToastController,
    public alertController:AlertController,
    public loadingController:LoadingController,
    public actionController:ActionSheetController) {
      super(zone, platform, logger, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
  }

  @ViewChild(Content)
  content: Content;

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString('#f9f9f8');
    });
  }

  showOptions() {
    this.logger.info(this, "showOptions");
    let buttons = [
      {
        text: "Search by Name",
        handler: () => {
          this.showSearch();
        }
      },
      {
        text: "Add by URL",
        handler: () => {
          this.showDialog();
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ];
    this.showActionSheet('Add Deployment', buttons);
  }

  showDialog() {
    this.logger.info(this, "showDialog");
    let prompt = this.alertController.create({
      title: 'Add by URL',
      message: "Enter the deployment details",
      inputs: [
        {
          name: 'name',
          placeholder: 'Name'
        },
        {
          name: 'url',
          placeholder: 'URL'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: data => {
            this.addDeployment(data['name'], data['url']);
          }
        }
      ]
    });
    prompt.present();
  }

  showSearch() {
    this.logger.info(this, "showSearch");
    let modal = this.showModal(DeploymentSearchPage, {});
    modal.onDidDismiss((data:any) => {
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString('#f9f9f8');
      if (data) {
        this.logger.info(this, "showSearch", data);
        let deployment:Deployment = data.deployment;
        this.showDeployment(deployment);
      }
    });
  }

  addDeployment(name:string, url:string) {
    this.logger.info(this, "addDeployment", name, url);
    if (!name || name.length == 0) {
      this.showAlert("Name Required", "Please enter the deployment name.");
    }
    else if (!url || url.length == 0) {
      this.showAlert("URL Required", "Please enter the deployment URL.");
    }
    else if (this.isUrlValid(url) == false) {
      this.showAlert("URL Required", "Please enter a valid deployment URL.");
    }
    else {
      let loading = this.showLoading("Adding...");
      this.api.registerDeployment(name, url).then(
        (deployment:Deployment) => {
          this.database.saveDeployment(deployment).then((saved) => {
            loading.dismiss();
            this.showDeployment(deployment);
          });
        },
        (error:any) => {
          this.showAlert("Problem Adding Deployment", "The deployment does not have the necessary configuration to be added into the app, please contact the deployer letting them know about the problem.");
        });
    }
  }

  showDeployment(deployment:Deployment) {
    this.logger.info(this, "showDeployment", deployment);
    this.showRootPage(DeploymentDetailsPage,
      { deployment: deployment },
      { animate: true,
        direction: 'forward' });
  }

  isUrlValid(url:string) {
    let result = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return result != null;
  }

}
