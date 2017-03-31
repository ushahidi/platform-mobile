import { Component, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation';

import { StaticMap } from '../../maps/static-map';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'input-location',
  templateUrl: 'input-location.html',
  inputs: ['value', 'attribute', 'formGroup', 'submitted', 'offline']
})
export class InputLocationComponent {

  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  map:string = null;
  latitude: number = null;
  longitude: number = null;
  submitted: boolean = false;
  error: boolean = false;
  offline: boolean = false;

  @Output()
  changeLocation = new EventEmitter();

  constructor(
    private geolocation:Geolocation,
    private logger:LoggerService) {

  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    if (this.value && this.value.value) {
      let location:any = this.value.value.split(",");
      this.latitude = Number(location[0]);
      this.longitude = Number(location[1]);
    }
    else {
      this.detectLocation();
    }
  }

  ngAfterContentChecked() {
    if (this.value && this.value.value && this.value.value.length > 0) {
      let location:any = this.value.value.split(",");
      let latitude = Number(location[0]);
      let longitude = Number(location[1]);
      if (this.latitude != latitude || this.longitude != longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.loadMapSrc(latitude, longitude);
      }
    }
  }

  detectLocation() {
    let options:GeolocationOptions = {
      timeout: 12000,
      enableHighAccuracy: true };
      this.logger.info(this, "detectLocation", options);
    this.geolocation.getCurrentPosition(options).then(
      (position:Geoposition) => {
        this.logger.info(this, "detectLocation", "Position", position);
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.error = false;
        this.loadMapSrc(this.latitude, this.longitude);
      },
      (error:any) => {
        this.logger.error(this, "detectLocation", "Error", error);
        this.latitude = null;
        this.longitude = null;
        this.error = true;
        this.loadMapSrc(null, null);
      });
  }

  updateLocation(event) {
    this.logger.info(this, "updateLocation");
    this.changeLocation.emit({
      latitude: this.latitude,
      longitude: this.longitude});
  }

  loadMapSrc(latitude, longitude) {
    if (latitude && longitude) {
      this.map = new StaticMap(latitude, longitude).getUrl();
    }
    else {
      this.map = null;
    }
  }
}
