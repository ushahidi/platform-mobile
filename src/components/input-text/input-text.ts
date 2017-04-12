import { Component, ViewChild } from '@angular/core';
import { TextInput } from 'ionic-angular';
import { FormGroup } from '@angular/forms';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'input-text',
  templateUrl: 'input-text.html',
  inputs: ['value', 'attribute', 'formGroup', 'submitted']
})
export class InputTextComponent {

  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  focused: boolean = false;
  submitted: boolean = false;
  text: string = "";

  @ViewChild('input')
  input: TextInput;

  constructor(public logger:LoggerService) {
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    if (this.value) {
      this.text = this.value.value;
    }
  }

  onFocus(event) {
    this.logger.info(this, "onFocus", this.attribute);
    this.focused = true;
  }

  onBlur(event) {
    this.logger.info(this, "onBlur", this.attribute);
    this.focused = false;
  }

}
