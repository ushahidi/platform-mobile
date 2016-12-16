import { Component } from '@angular/core';
import { Platform, NavParams, NavController, LoadingController, ToastController, AlertController, ViewController, ModalController } from 'ionic-angular';
import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsLatLngBounds, CameraPosition, GoogleMapsMarkerOptions, GoogleMapsMarker } from 'ionic-native';

@Component({
  selector: 'page-response-map',
  templateUrl: 'response-map.html'
})
export class ResponseMapPage {

  latitude: Number;
  longitude: Number;
  map: GoogleMap = null;

  constructor(
    public platform:Platform,
    public navParams: NavParams,
    public navController:NavController,
    public toastController: ToastController,
    public alertController: AlertController,
    public viewController: ViewController,
    public modalController: ModalController,
    public loadingController:LoadingController) {}

  ionViewDidLoad() {
    console.log('Response Map ionViewDidLoad');
  }

  ionViewWillEnter() {
    console.log("Response Map ionViewWillEnter");
    this.latitude = this.navParams.get("latitude");
    this.longitude = this.navParams.get("longitude");
    console.log(`Response Map ${this.latitude}, ${this.longitude}`);
  }

  ionViewDidEnter() {
    console.log("Response Map ionViewDidEnter");
    this.showMap();
  }

  onCancel(event) {
    console.log('Response Map onCancel');
    this.viewController.dismiss();
  }

  onDone(event) {
    console.log('Response Map onDone');
    this.viewController.dismiss();
  }

  showMap(attempts:number=0) {
    console.log(`Response Map showMap ${attempts}`);
    let element: HTMLElement = document.getElementById('map');
    if (element) {
      if (this.map) {
        this.map.remove();
      }
      this.map = new GoogleMap(element,
        { 'backgroundColor': '#e7e9ec' });
      this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
        console.log('Deployment List Map Ready');
      });
    }
    else {
      setTimeout((attempts) => {
        this.showMap(attempts+1);
      }, 1000, attempts);
    }
  }

}
