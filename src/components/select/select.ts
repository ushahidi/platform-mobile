import { Component, ViewChild } from '@angular/core';
import { Select } from 'ionic-angular';

@Component({
  selector: 'field-select',
  templateUrl: 'select.html',
  inputs: ['attribute']
})
export class SelectComponent {

  attribute: any = {};

  @ViewChild('select') select: Select;

  constructor() {
  }

}
