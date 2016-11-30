import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-checkbox',
  templateUrl: 'checkbox.html',
  inputs: ['attribute']
})
export class CheckboxComponent {

  attribute: any = {};

  constructor() {
  }

}
