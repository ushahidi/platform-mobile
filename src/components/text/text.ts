import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-text',
  templateUrl: 'text.html',
  inputs: ['attribute']
})
export class TextComponent {

  attribute: any = {};

  constructor() {
  }

}
