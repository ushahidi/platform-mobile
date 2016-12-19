import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController } from 'ionic-angular';
import { MediaCapture } from 'ionic-native';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

@Component({
  selector: 'field-video',
  templateUrl: 'video.html',
  inputs: ['attribute', 'formGroup']
})
export class VideoComponent {

  formGroup: FormGroup;
  attribute: any = {};
  videoData: any = null;
  videoThumbail: string;
  videoPlaceholder: string = "/assets/images/placeholder-video.jpg";

  constructor(
    public alertController:AlertController,
    public actionController:ActionSheetController) {
  }

  ngOnInit() {
    console.log(`Video ${JSON.stringify(this.attribute)}`);
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
