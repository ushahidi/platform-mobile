import { Component } from '@angular/core';
import { Platform, NavParams, NavController,
  LoadingController, ToastController, AlertController, ModalController, ActionSheetController } from 'ionic-angular';
import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsLatLngBounds, CameraPosition, GoogleMapsMarkerOptions, GoogleMapsMarker } from 'ionic-native';

import { ResponseAddPage } from '../response-add/response-add';
import { ResponseDetailsPage } from '../response-details/response-details';

import { CardComponent } from '../../components/card/card';

import { ApiService } from '../../providers/api-service';
import { DatabaseService } from '../../providers/database-service';

@Component({
  selector: 'page-response-list',
  templateUrl: 'response-list.html',
  providers: [ ApiService, DatabaseService ],
  entryComponents:[ ResponseAddPage, ResponseDetailsPage ]
})
export class ResponseListPage {

  token: string = null;
  deployment: any;
  responses: any;
  forms: any;
  map: GoogleMap;
  view: string = 'list';

  constructor(
    public platform:Platform,
    public api:ApiService,
    public database:DatabaseService,
    public navParams: NavParams,
    public navController:NavController,
    public toastController: ToastController,
    public alertController: AlertController,
    public modalController: ModalController,
    public loadingController:LoadingController,
    public actionController: ActionSheetController) {

  }

  ionViewDidLoad() {
    console.log('Response List ionViewDidLoad');
  }

  ionViewWillEnter() {
    console.log("Response List ionViewWillEnter");
    this.token = this.navParams.get("token");
    this.deployment = this.navParams.get("deployment");
    this.forms = this.navParams.get("forms");
    this.loadPosts();
  }

  ionViewDidEnter() {
    console.log("Response List ionViewDidEnter");
  }

  loadPosts(cache:boolean=true, event:any=null) {
    console.log(`Response List loadPosts Cache ${cache}`);
    if (cache) {
      this.database.getPosts(this.deployment.id).then(results => {
        let responses = <any[]>results;
        if (responses && responses.length > 0) {
          console.log(`Response List loadPosts Database ${responses.length}`);
          this.responses = responses;
        }
        else {
          this.loadPosts(false, event);
        }
      });
    }
    else {
      this.api.getPosts(this.deployment.url, this.token).then(results => {
        let responses = <any[]>results['results'];
        console.log(`Response List loadPosts API ${responses.length}`)
        this.responses = responses;
        for (let index in responses) {
          let response = responses[index];
          this.database.addPost(this.deployment.id, response);
        }
        if (event) {
          event.complete();
        }
      });
    }
  }

  showResponse(event, response) {
    console.log("Deployment List showResponse");
    this.navController.push(
      ResponseDetailsPage,
      { token: this.token,
        deployment: this.deployment,
        response: response });
  }

  addResponse(event) {
    console.log("Deployment Details addResponse");
    let buttons = [];
    if (this.forms) {
      for (var i = 0; i < this.forms.length; i++){
        let form = this.forms[i];
        buttons.push({
          text: form.name,
          handler: () => {
            console.log(`Deployment Details Form ${form.name} Selected`);
            this.showResponseAdd(form);
        }});
      }
    }
    buttons.push({
      text: 'Cancel',
      role: 'cancel'});
    let actionSheet = this.actionController.create({
      title: 'Submit a survey response',
      buttons: buttons
    });
    actionSheet.present();
  }

  showResponseAdd(form) {
    let modal = this.modalController.create(
      ResponseAddPage,
      { token: this.token,
        form: form,
        deployment: this.deployment });
    modal.present();
    modal.onDidDismiss(data => {

    });
  }

  searchResponses(event) {
    console.log("Deployment List searchResponses");
    let toast = this.toastController.create({
      message: 'Search Not Implemented',
      duration: 1500
    });
    toast.present();
  }

  shareResponses(event) {
    console.log("Deployment List shareResponses");
    let toast = this.toastController.create({
      message: 'Sharing Not Implemented',
      duration: 1500
    });
    toast.present();
  }

  showOptions(event, response) {
    console.log("Deployment List showOptions");
    let actionSheet = this.actionController.create({
    buttons: [
       {
         text: 'Edit',
         handler: () => {
           console.log('Deployment List Edit');
         }
       },
       {
         text: 'Add to Collection',
         handler: () => {
           console.log('Deployment List Add');
         }
       },
       {
         text: 'Share',
         handler: () => {
           console.log('Deployment List Share');
         }
       },
       {
         text: 'Delete',
         role: 'destructive',
         handler: () => {
           console.log('Deployment List Delete');
         }
       },
       {
         text: 'Cancel',
         role: 'cancel',
         handler: () => {
           console.log('Deployment List Cancel');
         }
       }
     ]
   });
   actionSheet.present();
  }

  showList(event) {
    console.log("Deployment List showList");
    this.view = 'list';
    if (this.map) {
      this.map.setVisible(false);
    }
  }

  showMap(event, attempts:number=0) {
    console.log(`Deployment List showMap ${attempts}`);
    this.view = 'map';
    let element: HTMLElement = document.getElementById('map');
    if (element) {
      if (this.map) {
        this.map.remove();
      }
      this.map = new GoogleMap(element,
        { 'backgroundColor': '#e7e9ec' });
      this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
        console.log('Deployment List Map Ready');
        let points = [];
        for (var i = 0; i <= this.responses.length; i++){
          let response = this.responses[i];
          if (response && response.latitude && response.longitude) {
            console.log(`Deployment List Latitude ${response.latitude} Longitude ${response.longitude}`);
            let latitude = Number(response.latitude);
            let longitude = Number(response.longitude);
            let coordinate: GoogleMapsLatLng = new GoogleMapsLatLng(latitude, longitude);
            console.log(`Deployment List Coordinate ${coordinate}`);
            let options: GoogleMapsMarkerOptions = {
              position: coordinate,
              title: response.title
            };
            points.push(coordinate);
            console.log(`Deployment List Marker ${response.title}`);
            this.map.addMarker(options)
              .then((marker: GoogleMapsMarker) => {
                marker.showInfoWindow();
              });
          }
        }
        if (points.length > 0) {
          console.log(`Deployment List Points ${points.length}`);
          var bounds: GoogleMapsLatLngBounds = new GoogleMapsLatLngBounds(points);
          console.log(`Deployment List Center ${bounds.getCenter()}`);
          let position: CameraPosition = {
             target: bounds.getCenter(),
             zoom: 15,
             tilt: 0
           };
           this.map.moveCamera(position);
        }
      });
    }
    else {
      setTimeout((attempts) => {
        this.showMap(event, attempts+1);
      }, 1000, attempts);
    }
  }

}
