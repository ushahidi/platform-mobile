import { Component, NgZone } from '@angular/core';
import { Platform, NavParams,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController  } from 'ionic-angular';
import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, CameraPosition, GoogleMapsMarkerOptions, GoogleMapsMarker } from 'ionic-native';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import { SebmGoogleMap, SebmGoogleMapMarker } from 'angular2-google-maps/core';

import { BasePage } from '../../pages/base-page/base-page';

import { LoggerService } from '../../providers/logger-service';

declare var google: any;

@Component({
  selector: 'page-response-map',
  templateUrl: 'response-map.html',
  providers: [ LoggerService ],
})
export class ResponseMapPage extends BasePage {

  latitude: number;
  longitude: number;
  mapZoom : number = 16;
  mapDraggable: boolean = true;
  markerDraggable: boolean = true;
  zoomControl : boolean = false;
  disableDefaultUI : boolean = true;

  constructor(
    public logger:LoggerService,
    public navParams: NavParams,
    public zone: NgZone,
    public platform:Platform,
    public sanitizer:DomSanitizer,
    public navController:NavController,
    public viewController:ViewController,
    public modalController:ModalController,
    public toastController:ToastController,
    public alertController:AlertController,
    public loadingController:LoadingController,
    public actionController:ActionSheetController) {
      super(zone, platform, navController, viewController, modalController, toastController, alertController, loadingController, actionController);
    }

  ionViewDidLoad() {
    super.ionViewDidLoad();
    this.logger.info(this, 'ionViewDidLoad');
  }

  toQueryString(url, params) {
    return url + '?' + Object.keys(params).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.logger.info(this, "ionViewWillEnter");
    this.latitude = this.navParams.get("latitude");
    this.longitude = this.navParams.get("longitude");
  }

  ionViewDidEnter() {
    this.logger.info(this, "ionViewDidEnter");
  }

  onCancel(event:any) {
    this.logger.info(this, 'onCancel');
    this.hideModal();
  }

  onDone(event:any) {
    this.logger.info(this, 'onDone');
    this.hideModal({
      latitude: this.latitude,
      longitude: this.longitude });
  }

  dragEnd(event:any) {
    this.logger.info(this, 'dragEnd', event);
    if (event && event.coords) {
      this.latitude = event.coords.lat;
      this.longitude = event.coords.lng;
    }
  }

}
