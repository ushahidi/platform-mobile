import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-location',
  templateUrl: 'location.html',
  inputs: ['attribute']
})
export class LocationComponent {

  attribute: string;

  constructor() {
  }

  detectLocation() {

  }
}
