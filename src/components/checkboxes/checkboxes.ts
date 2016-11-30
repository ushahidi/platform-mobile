import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-checkboxes',
  templateUrl: 'checkboxes.html',
    inputs: ['attribute']
})
export class CheckboxesComponent {

  attribute: any;

  constructor() {
  }

}
