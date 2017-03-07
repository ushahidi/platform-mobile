import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, NavParams, Content,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController  } from 'ionic-angular';

import { TileLayer } from '../../maps/tile-layer';
import { MapMarker } from '../../maps/map-marker';

import { BasePage } from '../../pages/base-page/base-page';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'response-map-page',
  templateUrl: 'response-map.html',
  providers: [ LoggerService ],
})
export class ResponseMapPage extends BasePage {

  map:any = null;
  zoom:number = 16;
  latitude:number = null;
  longitude:number = null;

  @ViewChild(Content)
  content: Content;

  constructor(
    public logger:LoggerService,
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

  ionViewDidLoad() {
    super.ionViewDidLoad();
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.latitude = this.getParameter<number>("latitude");
    this.longitude = this.getParameter<number>("longitude");
    this.loadMap(this.latitude, this.longitude).then((map) => {
      this.loadMarker(this.latitude, this.longitude).addTo(map);
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.showToast("Drag the map marker to change the location");
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

  loadMap(latitude:number, longitude:number):Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadMap");
      this.map = L.map('map').setView([latitude, longitude], this.zoom);
      L.tileLayer(new TileLayer().getUrl(), {
        maxZoom: 18
      }).addTo(this.map);
      resolve(this.map);
    });
  }

  loadMarker(latitude:number, longitude:number):L.Marker {
    this.logger.info(this, "loadMarker", latitude, longitude);
    let icon = L.icon({
      iconUrl: new MapMarker().getUrl(),
      iconSize: [30, 70],
      popupAnchor: [0, -26]
    });
    let marker = L.marker([latitude, longitude], {
      icon: icon,
      draggable: true });
    marker.on("dragend", (event) => {
      let coordinates = event.target.getLatLng();
      this.latitude = coordinates.lat;
      this.longitude = coordinates.lng;
      this.logger.info(this, "dragEnd", this.latitude, this.longitude);
    });
    return marker;
  }

}
