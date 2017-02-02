import { Component, ViewChild } from '@angular/core';
import { TextArea } from 'ionic-angular';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'field-textarea',
  templateUrl: 'textarea.html',
  inputs: ['value', 'attribute', 'formGroup']
})
export class TextAreaComponent {

  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  required: boolean = false;
  focused: boolean = false;
  text: string = "";

  @ViewChild('textarea')
  textarea: TextArea;

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
