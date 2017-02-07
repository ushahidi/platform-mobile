import { Component, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController } from 'ionic-angular';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions } from 'ionic-native';
import { FormGroup, FormGroupName, FormControl, FormControlName } from '@angular/forms';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'field-video',
  templateUrl: 'video.html',
  inputs: ['value', 'attribute', 'formGroup']
})
export class VideoComponent {

  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  videoData: string = null;
  videoThumbail: string = null;

  constructor(
    public logger:LoggerService,
    public alertController:AlertController,
    public actionController:ActionSheetController) {
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    this.logger.info(this, "SupportedVideoModes", MediaCapture.supportedVideoModes);
  }

  captureVideo() {
    this.logger.info(this, "captureVideo");
    let options = {
      limit: 3
    };
    MediaCapture.captureVideo(options).then(
      (data:MediaFile[]) => {
        this.logger.info(this, "captureVideo", data);
      },
      (error) => {
        this.logger.error(this, "captureVideo", error);
        let alert = this.alertController.create({
          title: 'Problem Taking Video',
          subTitle: "There was a problem trying to capture video.",
          buttons: ['OK']
        });
        alert.present();
      }
    );
  }

  deleteVideo() {
    this.logger.info(this, "deleteVideo");
  }
}
