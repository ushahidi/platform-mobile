import { Component, NgZone } from '@angular/core';
import { Platform, NavParams,
  NavController, ViewController, LoadingController, ToastController, AlertController, ModalController, ActionSheetController  } from 'ionic-angular';

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
