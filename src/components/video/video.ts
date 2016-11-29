import { Component, Input } from '@angular/core';

@Component({
  selector: 'field-video',
  templateUrl: 'video.html',
  inputs: ['label', 'type', 'value']
})
export class VideoComponent {

  label: string;
  type: string;
  value: string;

  constructor() {
  }

}
