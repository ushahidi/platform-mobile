import { Component, ViewChild } from '@angular/core';
import { Button, TextInput } from 'ionic-angular';
import { Geolocation } from 'ionic-native';

@Component({
  selector: 'field-location',
  templateUrl: 'location.html',
  inputs: ['attribute']
})
export class LocationComponent {

  attribute: any = {};
  latitude: number = 0;
  longitude: number = 0;

  @ViewChild('button') button: Button;
  @ViewChild('location') location: TextInput;

  constructor() {
  }

  ngOnInit() {
    this.detectLocation();
  }

  detectLocation() {
    console.log(`Location detectLocation`);
    Geolocation.getCurrentPosition().then(
      (position) => {
        console.log(`Location ${JSON.stringify(position)}`);
        this.longitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.location.value = `${position.coords.latitude}, ${position.coords.longitude}`;
      },
      (error) => {
        console.error(`Location ${JSON.stringify(error)}`);
        this.longitude = null;
        this.longitude = null;
        this.location.value = null;
      });
  }
}
