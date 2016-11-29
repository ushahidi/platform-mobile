import { Component, Input } from '@angular/core';
import { Camera } from 'ionic-native';

@Component({
  selector: 'field-image',
  templateUrl: 'image.html',
  inputs: ['label', 'type', 'value']
})
export class ImageComponent {

  label: string;
  type: string;
  value: string;
  base64Image: string;

  constructor() {
  }

  takePicture() {
    Camera.getPicture({
      destinationType: Camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000
    }).then((imageData) => {
        this.base64Image = "data:image/jpeg;base64," + imageData;
    }, (err) => {
        console.log(err);
    });
  }
}
