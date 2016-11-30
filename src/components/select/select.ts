import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-select',
  templateUrl: 'select.html',
  inputs: ['attribute']
})
export class SelectComponent {

  attribute: any = {};

  constructor() {
  }

}
