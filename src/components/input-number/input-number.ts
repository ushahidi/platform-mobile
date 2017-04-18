import { Component, ViewChild } from '@angular/core';
import { TextInput } from 'ionic-angular';
import { FormGroup } from '@angular/forms';
import { Keyboard } from '@ionic-native/keyboard';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'input-number',
  templateUrl: 'input-number.html',
  inputs: ['value', 'attribute', 'formGroup', 'submitted']
})
export class InputNumberComponent {

  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  focused: boolean = false;
  submitted: boolean = false;
  text: string = "";
  pattern:string = "[0-9]*";
  decimal:boolean = false;

  @ViewChild('input')
  input: TextInput;

  constructor(
    private keyboard:Keyboard,
    private logger:LoggerService) {
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    if (this.attribute.type == 'decimal') {
      this.decimal = true;
      this.pattern = "[0-9\.]*";
    }
    else {
      this.decimal = false;
      this.pattern = "[0-9]*";
    }
    if (this.value && this.value.value) {
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

  onKeyPress(event) {
    if (event.keyCode == 43) {
      return true;
    }
    else if (event.keyCode == 45) {
      return true;
    }
    else if (event.keyCode == 46 && this.decimal == true) {
      return true;
    }
    else if (event.keyCode >= 48 && event.keyCode <= 57) {
      return true;
    }
    else if (event.keyCode == 13) {
      this.keyboard.close();
      return false;
    }
    else {
      return false;
    }
  }

}
