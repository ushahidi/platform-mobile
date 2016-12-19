import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { TextInput } from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

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

  @Output() changeLocation = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
    console.log(`Location ${JSON.stringify(this.attribute)}`);
    this.detectLocation();
  }

  detectLocation() {
    console.log(`Location detectLocation`);
    Geolocation.getCurrentPosition().then(
      (position) => {
        console.log(`Location ${JSON.stringify(position)}`);
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.mapImage = `https://maps.googleapis.com/maps/api/staticmap`
          + `?center=${position.coords.latitude},${position.coords.longitude}`
          + `&zoom=15&size=300x200&maptype=roadmap&markers=color:red%7C`
          + `${position.coords.latitude},${position.coords.longitude}&key=${this.key}`;
      },
      (error) => {
        console.error(`Location ${JSON.stringify(error)}`);
        this.latitude = null;
        this.longitude = null;
        this.mapImage = null;
      });
  }

  mapClicked(event) {
    console.log(`Location inputClicked`);
    this.changeLocation.emit({
      latitude: this.latitude,
      longitude: this.longitude});
  }
}
