import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { TextInput } from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'field-location',
  templateUrl: 'location.html',
  inputs: ['attribute', 'formGroup', 'formGroupName']
})
export class LocationComponent {

  formGroup: FormGroup;
  attribute: any = {};
  key: string = "AIzaSyBjDgMqF6GOdirXn3iFtI6Jlt8jEoWhSq4";
  mapPlaceholder: string = "/assets/images/placeholder-map.jpg";
  mapImage: string = null;
  latitude: number = null;
  longitude: number = null;
  required: boolean = false;

  @Output()
  changeLocation = new EventEmitter();

  constructor(public logger:LoggerService) {
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute);
    this.required = this.attribute.required == "true";
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
