import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, Content, NavParams, NavController, ViewController, ModalController, ToastController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Keyboard } from '@ionic-native/keyboard';
import { Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation';
import { NativeGeocoder, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';

import { TileLayer } from '../../maps/tile-layer';
import { MapMarker } from '../../maps/map-marker';

import { BasePage } from '../../pages/base-page/base-page';

import { Deployment } from '../../models/deployment';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'response-map-page',
  templateUrl: 'response-map.html',
  providers: [ LoggerService ],
})
export class ResponseMapPage extends BasePage {

  deployment:Deployment;
  map:any = null;
  mapZoom:number = 17;
  mapLayer:any = null;
  marker:any = null;
  mapStyle:string = "streets";
  draggable:boolean = false;
  latitude:number = null;
  longitude:number = null;
  modal:boolean = true;
  title:string = "Location";
  search:string = null;

  @ViewChild(Content)
  content: Content;

  constructor(
    protected zone:NgZone,
    protected platform:Platform,
    protected navParams:NavParams,
    protected navController:NavController,
    protected viewController:ViewController,
    protected modalController:ModalController,
    protected toastController:ToastController,
    protected alertController:AlertController,
    protected loadingController:LoadingController,
    protected actionController:ActionSheetController,
    protected logger:LoggerService,
    protected nativeGeocoder:NativeGeocoder,
    protected geolocation:Geolocation,
    protected keyboard:Keyboard) {
    super(zone, platform, navParams, navController, viewController, modalController, toastController, alertController, loadingController, actionController, logger);
  }

  ionViewWillEnter() {
    super.ionViewWillEnter();
    this.deployment = this.getParameter<Deployment>("deployment");
    this.modal = this.getParameter<boolean>("modal");
    this.title = this.getParameter<string>("title");
    this.latitude = this.getParameter<number>("latitude");
    this.longitude = this.getParameter<number>("longitude");
    this.draggable = this.getParameter<boolean>("draggable");
    this.loadMap(this.latitude, this.longitude).then((map:any) => {
      this.loadLocation().then((location:any) => {
        if (location) {
          location.addTo(map);
        }
        this.loadMarker(this.latitude, this.longitude).then((marker:any) => {
          if (marker) {
            marker.addTo(map);
          }
        });
      });
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    if (this.draggable) {
      this.language.getTranslation('MAP_DRAG').then((translation:string) => {
        this.showToast(translation, 3000);
      });
    }
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
      let tileLayerUrl = new TileLayer(this.deployment.mapbox_api_key, this.mapStyle).getUrl();
      this.map = L.map("mapOne").setView([latitude, longitude], this.mapZoom);
      this.mapLayer = L.tileLayer(tileLayerUrl, { maxZoom: 20 });
      this.mapLayer.addTo(this.map);
      resolve(this.map);
    });
  }

  loadMarker(latitude:number, longitude:number):Promise<any> {
    this.logger.info(this, "loadMarker", latitude, longitude);
    return new Promise((resolve, reject) => {
      let iconUrl = new MapMarker(this.deployment.mapbox_api_key).getUrl();
      let icon = L.icon({
        iconUrl: iconUrl,
        iconSize: [30, 70],
        popupAnchor: [0, -26]
      });
      this.marker = L.marker([latitude, longitude], {
        icon: icon,
        draggable: this.draggable });
      this.marker.on("dragend", (event) => {
        let coordinates = event.target.getLatLng();
        this.latitude = coordinates.lat;
        this.longitude = coordinates.lng;
        this.logger.info(this, "dragEnd", this.latitude, this.longitude);
      });
      resolve(this.marker);
    });
  }

  loadLocation():Promise<any> {
    this.logger.info(this, "loadLocation");
    return new Promise((resolve, reject) => {
      let options:GeolocationOptions = {
        timeout: 12000,
        enableHighAccuracy: true };
      this.geolocation.getCurrentPosition(options).then(
        (position:Geoposition) => {
          this.logger.info(this, "loadLocation", "Position", position);
          if (position && position.coords) {
            var icon = L.divIcon({
              className: 'css-icon',
              html: '<div class="gps-ring"></div>',
              iconSize: [22,22]
            });
            let marker = L.marker([position.coords.latitude, position.coords.longitude], {
              icon: icon,
              draggable: false });
            resolve(marker);
          }
        },
        (error:any) => {
          this.logger.error(this, "loadLocation", "Error", error.message);
          resolve(null);
        });
    });
  }

  showStyles(event) {
    this.language.getTranslations([
      'MAP_STYLE_STREETS',
      'MAP_STYLE_OUTDOORS',
      'MAP_STYLE_LIGHT',
      'MAP_STYLE_DARK',
      'MAP_STYLE_SATELLITE',
      'MAP_STYLE_SATELLITE_STREETS',
      'ACTION_CANCEL',
      'MAP_STYLE']).then((translations:string[]) => {
      this.logger.info(this, "showStyles");
      let buttons = [
        {
          text: translations[0],
          handler:() => this.changeStyle("streets")
        },
        {
          text: translations[1],
          handler:() => this.changeStyle("outdoors")
        },
        {
          text: translations[2],
          handler:() => this.changeStyle("light")
        },
        {
          text: translations[3],
          handler:() => this.changeStyle("dark")
        },
        {
          text: translations[4],
          handler:() => this.changeStyle("satellite")
        },
        {
          text: translations[5],
          handler:() => this.changeStyle("satellite-streets")
        },
        {
          text: translations[6],
          role: 'cancel'
        }
      ];
      this.showActionSheet(translations[7], buttons);
    });
  }

  changeStyle(mapStyle:string) {
    this.logger.info(this, "changeStyle", mapStyle);
    this.mapStyle = mapStyle;
    this.map.removeLayer(this.mapLayer);
    this.mapLayer = L.tileLayer(new TileLayer(this.mapStyle).getUrl(), { maxZoom: 20 });
    this.mapLayer.addTo(this.map);
  }

  searchAddress(event:any) {
    this.logger.info(this, "searchAddress", event.keyCode);
    if (event.keyCode == 13 || event.keyCode == 176) {
      this.keyboard.close();
      if (this.search && this.search.length > 0) {
        this.nativeGeocoder.forwardGeocode(this.search).then(
          (coordinates:NativeGeocoderForwardResult) => {
            this.logger.info(this, "searchAddress", coordinates);
            if (coordinates && coordinates.latitude && coordinates.longitude) {
              this.latitude = Number(coordinates.latitude);
              this.longitude = Number(coordinates.longitude);
              let latLng:L.LatLngLiteral = {
                lat: this.latitude,
                lng: this.longitude
              };
              this.marker.setLatLng(latLng);
              this.map.flyTo(latLng);
            }
          },
          (error:any) => {
            this.logger.error(this, "searchAddress", error)
          });
      }
    }
  }

}
