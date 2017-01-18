import { Component, ViewChild } from '@angular/core';
import { TextInput } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'field-text',
  templateUrl: 'text.html',
  inputs: ['attribute', 'formGroup']
})
export class TextComponent {

  formGroup: FormGroup;
  attribute: any = {};
  required: boolean = false;
  focused: boolean = false;
  value: string = "";

  @ViewChild('input')
  input: TextInput;

  constructor(public logger:LoggerService) {
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute);
    this.required = this.attribute.required == "true";
  }

  onFocus(event) {
    this.logger.info(this, "onFocus", this.attribute);
    this.focused = true;
  }

  onBlur(event) {
    this.logger.info(this, "onBlue", this.attribute);
    this.focused = false;
  }

}
