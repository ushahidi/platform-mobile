import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-number',
  templateUrl: 'number.html',
  inputs: ['attribute']
})
export class NumberComponent {

  attribute: any = {};

  constructor() {
  }

}
