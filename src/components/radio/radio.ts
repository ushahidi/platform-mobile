import { Component, ViewChild } from '@angular/core';
import { RadioGroup } from 'ionic-angular';

@Component({
  selector: 'field-radio',
  templateUrl: 'radio.html',
  inputs: ['attribute']
})
export class RadioComponent {

  attribute: any = {};

  @ViewChild('radio') radio: RadioGroup;

  constructor() {
  }

}
