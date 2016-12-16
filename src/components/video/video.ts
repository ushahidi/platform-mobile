import { Component, ViewChild } from '@angular/core';
import { Button, ActionSheetController, AlertController } from 'ionic-angular';
import { MediaCapture } from 'ionic-native';

@Component({
  selector: 'field-video',
  templateUrl: 'video.html',
  inputs: ['attribute']
})
export class VideoComponent {

  attribute: any = {};
  videoData: any = null;
  videoThumbail: string;
  videoPlaceholder: string;

  @ViewChild('button') button: Button;

  constructor(
    public alertController:AlertController,
    public actionController:ActionSheetController) {
    this.videoPlaceholder = "/assets/images/placeholder-video.jpg";
  }

  captureVideo() {
    let options = {
      limit: 3
    };
    MediaCapture.captureImage(options).then(
        (data) => {
          console.log(data)
        },
        (error) => {
          console.error(error);
          let alert = this.alertController.create({
            title: 'Problem Taking Video',
            subTitle: "There was a problem trying to capture video.",
            buttons: ['OK']
          });
          alert.present();
        }
      );
  }
}
