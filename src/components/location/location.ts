import { Component, ViewChild } from '@angular/core';
import { Button } from 'ionic-angular';

@Component({
  selector: 'field-location',
  templateUrl: 'location.html',
  inputs: ['attribute']
})
export class LocationComponent {

  attribute: any = {};

  @ViewChild('button') button: Button;

  constructor() {
  }

  detectLocation() {

  }
}
