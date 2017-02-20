import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { TextInput } from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

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
  latitude: number = null;
  longitude: number = null;
  submitted: boolean = false;

  @Output()
  changeLocation = new EventEmitter();

  constructor(public logger:LoggerService) {

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
      if (this.latitude != latitude) {
        this.latitude = latitude;
      }
      if (this.longitude != longitude) {
        this.longitude = longitude;
      }
    }
  }

  detectLocation() {
    this.logger.info(this, "detectLocation");
    Geolocation.getCurrentPosition().then(
      (position) => {
        this.logger.info(this, "detectLocation", "Location", position);
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      },
      (error) => {
        this.logger.error(this, "detectLocation", "Error", error);
        this.latitude = null;
        this.longitude = null;
      });
  }

  updateLocation(event) {
    this.logger.info(this, "updateLocation");
    this.changeLocation.emit({
      latitude: this.latitude,
      longitude: this.longitude});
  }
}
