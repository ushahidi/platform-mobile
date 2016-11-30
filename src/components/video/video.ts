import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-video',
  templateUrl: 'video.html',
  inputs: ['attribute']
})
export class VideoComponent {

  attribute: any = {};

  constructor() {
  }

  captureVideo() {

  }
}
