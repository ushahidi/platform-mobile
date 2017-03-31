import { Component } from '@angular/core';
import { Platform, ActionSheetController, AlertController } from 'ionic-angular';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions } from '@ionic-native/media-capture';
import { File, Entry, FileError } from '@ionic-native/file';
import { FormGroup } from '@angular/forms';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

declare var cordova:any;

@Component({
  selector: 'input-video',
  templateUrl: 'input-video.html',
  inputs: ['value', 'attribute', 'formGroup', 'submitted']
})
export class InputVideoComponent {

  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  videoPath: string = null;
  videoPreview: SafeResourceUrl = null;
  submitted: boolean = false;

  constructor(
    private file:File,
    private mediaCapture:MediaCapture,
    private platform:Platform,
    private sanitizer:DomSanitizer,
    private logger:LoggerService,
    private alertController:AlertController,
    private actionController:ActionSheetController) {
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    this.logger.info(this, "SupportedVideoModes", this.mediaCapture.supportedVideoModes);
  }

  captureVideo() {
    this.logger.info(this, "captureVideo");
    let options:CaptureImageOptions = {
      limit: 3
    };
    this.mediaCapture.captureVideo(options).then(
      (data:MediaFile[]) => {
        let mediaFile = data[0];
        this.logger.info(this, "captureVideo", data);
        this.copyFile(mediaFile.fullPath).then(
          (filePath:string) => {
            this.logger.info(this, "captureVideo", filePath);
            this.videoPath = filePath;
            this.videoPreview = this.sanitizer.bypassSecurityTrustResourceUrl(filePath);
          },
          (error) => {
            this.logger.error(this, "captureVideo", error);
            this.videoPath = null;
            this.videoPreview = null;
          });
      },
      (error:CaptureError) => {
        this.logger.error(this, "captureVideo", error);
        this.videoPath = null;
        this.videoPreview = null;
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
    this.videoPath = null;
    this.videoPreview = null;
  }

  copyFile(filePath:string){
    return new Promise((resolve, reject) => {
      let fileName = filePath.substr(filePath.lastIndexOf('/') + 1).split('?').shift();
      let fileDirectory = `file://${filePath.substr(0, filePath.lastIndexOf('/') + 1)}`;
      let storeDirectory = this.platform.is('ios') ? cordova.file.documentsDirectory : cordova.file.dataDirectory;
      let storePath = `${storeDirectory}${fileName}`;
      this.logger.info(this, "copyFile", fileDirectory, fileName, storeDirectory);
      this.file.copyFile(fileDirectory, fileName, storeDirectory, fileName).then(
        (entry:Entry) => {
          this.logger.info(this, "copyFile", entry.fullPath, storePath);
          resolve(storePath);
        },
        (error:FileError) => {
          this.logger.error(this, "copyFile", error);
          reject(error);
        });
    });
  }

}
