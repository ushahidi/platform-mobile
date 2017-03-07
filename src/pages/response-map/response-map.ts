import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, NavParams, Content,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController  } from 'ionic-angular';

import { Layer } from '../../maps/layer';
import { Marker } from '../../maps/marker';

import { BasePage } from '../../pages/base-page/base-page';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'response-map-page',
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

  map:any=null;

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
      this.map = L.map('map').setView([latitude, longitude], 12);
      L.tileLayer(new Layer().getUrl(), {
        maxZoom: 18
      }).addTo(this.map);
      resolve(this.map);
    });
  }

  loadMarker(latitude:number, longitude:number):L.Marker {
    this.logger.info(this, "loadMarker", latitude, longitude);
    let icon = L.icon({
      iconUrl: new Marker().getUrl(),
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
