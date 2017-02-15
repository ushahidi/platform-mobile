import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { TextInput } from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

import { PLACEHOLDER_MAP } from '../../helpers/constants';

@Component({
  selector: 'field-location',
  templateUrl: 'location.html',
  inputs: ['value', 'attribute', 'formGroup', 'submitted']
})
export class LocationComponent {

  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  key: string = "AIzaSyBjDgMqF6GOdirXn3iFtI6Jlt8jEoWhSq4";
  mapPlaceholder: string = PLACEHOLDER_MAP;
  mapImage: string = null;
  latitude: number = null;
  longitude: number = null;
  submitted: boolean = false;

  @Output()
  changeLocation = new EventEmitter();

  constructor(public logger:LoggerService) {

  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    this.detectLocation();
  }

  detectLocation() {
    this.logger.info(this, "detectLocation");
    Geolocation.getCurrentPosition().then(
      (position) => {
        this.logger.info(this, "detectLocation", "Location", position);
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.mapImage = `https://maps.googleapis.com/maps/api/staticmap`
          + `?center=${position.coords.latitude},${position.coords.longitude}`
          + `&zoom=15&size=300x200&maptype=roadmap&markers=color:red%7C`
          + `${position.coords.latitude},${position.coords.longitude}&key=${this.key}`;
        this.logger.info(this, "detectLocation", "Map", this.mapImage);
      },
      (error) => {
        this.logger.error(this, "detectLocation", error);
        this.latitude = null;
        this.longitude = null;
        this.mapImage = null;
      });
  }

  updateLocation(event) {
    this.logger.info(this, "updateLocation");
    this.changeLocation.emit({
      latitude: this.latitude,
      longitude: this.longitude});
  }
}
