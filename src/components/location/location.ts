import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-location',
  templateUrl: 'location.html',
  inputs: ['label', 'type', 'value']
})
export class LocationComponent {

  label: string;
  type: string;
  value: string;

  constructor() {
  }

}
