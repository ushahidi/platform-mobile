import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-radio',
  templateUrl: 'radio.html',
  inputs: ['attribute']
})
export class RadioComponent {

  attribute: any;

  constructor() {
  }

}
