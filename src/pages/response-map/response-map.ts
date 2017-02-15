import { Component, NgZone } from '@angular/core';
import { Platform, NavParams,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController  } from 'ionic-angular';
import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, CameraPosition, GoogleMapsMarkerOptions, GoogleMapsMarker } from 'ionic-native';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

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
  mapUrl: string = "https://www.google.com/maps/embed/v1/place";
  mapSrc: SafeResourceUrl = null;
  mapKeyIOS: string = "AIzaSyDkaRT-VLExcP6B9ObyEgppKbDN9-szc8E";
  mapKeyAndroid: string = "AIzaSyDPK1w611ECN1TiR7CSgomPE_vLy321XBI";

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
    if (this.platform.is('ios')) {
      this.mapSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.mapUrl}?key=${this.mapKeyIOS}&q=${this.latitude},${this.longitude}`);
    }
    else {
      this.mapSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.mapUrl}?key=${this.mapKeyAndroid}&q=${this.latitude},${this.longitude}`);
    }
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.logger.info(this, "ionViewWillEnter");
    this.latitude = this.navParams.get("latitude");
    this.longitude = this.navParams.get("longitude");
  }

  ionViewDidEnter() {
    this.logger.info(this, "ionViewDidEnter");
    //this.showMap();
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
    let element: HTMLElement = document.getElementById('modalMap');
    if (element) {
      this.map = new GoogleMap(element, { backgroundColor: '#e7e9ec' });
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
            title: 'Current Location'
          };
          this.map.addMarker(markerOptions).then(
            (marker) => {
              marker.on(GoogleMapsEvent.MARKER_CLICK, () => {
                marker.showInfoWindow();
              });
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
