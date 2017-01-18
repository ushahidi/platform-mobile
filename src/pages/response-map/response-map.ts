import { Component } from '@angular/core';
import { Platform, NavParams,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController  } from 'ionic-angular';
import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, CameraPosition, GoogleMapsMarkerOptions, GoogleMapsMarker } from 'ionic-native';

import { BasePage } from '../../pages/base-page/base-page';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'page-response-map',
  templateUrl: 'response-map.html',
  providers: [ LoggerService ],
})
export class ResponseMapPage extends BasePage {

  latitude: number;
  longitude: number;
  map: GoogleMap = null;

  constructor(
    public platform:Platform,
    public logger:LoggerService,
    public navParams: NavParams,
    public navController:NavController,
    public viewController:ViewController,
    public modalController:ModalController,
    public toastController:ToastController,
    public alertController:AlertController,
    public loadingController:LoadingController,
    public actionController:ActionSheetController) {
      super(navController, viewController, modalController, toastController, alertController, loadingController, actionController);
    }

  ionViewDidLoad() {
    this.logger.info(this, 'ionViewDidLoad');
  }

  ionViewWillEnter() {
    this.logger.info(this, "ionViewWillEnter");
    this.latitude = this.navParams.get("latitude");
    this.longitude = this.navParams.get("longitude");
  }

  ionViewDidEnter() {
    this.logger.info(this, "ionViewDidEnter");
    this.showMap();
  }

  onCancel(event) {
    this.logger.info(this, 'onCancel');
    this.hideModal();
  }

  onDone(event) {
    this.logger.info(this, 'onDone');
    this.hideModal({
      latitude: this.latitude,
      longitude: this.longitude });
  }

  showMap(attempts:number=0) {
    this.logger.info(this, "showMap", attempts);
    let element: HTMLElement = document.getElementById('map');
    if (element) {
      this.map = new GoogleMap(element,
        { 'backgroundColor': '#e7e9ec' });
      this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
        this.logger.info(this, "showMap", "Map Ready");
        if (this.latitude && this.longitude) {
          let location = new GoogleMapsLatLng(this.latitude, this.longitude);
          let position: CameraPosition = {
            target: location,
            zoom: 16
          };
          this.map.moveCamera(position);
          let markerOptions: GoogleMapsMarkerOptions = {
            position: location,
            title: 'My Location'
          };
          this.map.addMarker(markerOptions).then(
            (marker) => {
              marker.showInfoWindow();
            });
        }
      });
    }
    else {
      setTimeout((attempts) => {
        this.showMap(attempts+1);
      }, 1000, attempts);
    }
  }

}
