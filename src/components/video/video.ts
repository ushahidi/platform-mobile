import { Component, ViewChild } from '@angular/core';
import { Button } from 'ionic-angular';

@Component({
  selector: 'field-video',
  templateUrl: 'video.html',
  inputs: ['attribute']
})
export class VideoComponent {

  attribute: any = {};

  @ViewChild('button') button: Button;

  constructor() {
  }

  captureVideo() {

  }
}
