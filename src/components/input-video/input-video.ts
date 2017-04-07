import { Component } from '@angular/core';
import { Platform, ActionSheetController, AlertController } from 'ionic-angular';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions } from '@ionic-native/media-capture';
import { File, Entry, FileEntry, FileError } from '@ionic-native/file';
import { FormGroup } from '@angular/forms';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { Diagnostic } from '@ionic-native/diagnostic';

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

  PERMISSION_GRANTED:string = "granted";
  PERMISSION_AUTHORIZED:string = "authorized";
  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  videoPath: string = null;
  videoPreview: SafeResourceUrl = null;
  submitted: boolean = false;
  mimeType:string = "video/mov";

  constructor(
    private file:File,
    private mediaCapture:MediaCapture,
    private platform:Platform,
    private sanitizer:DomSanitizer,
    private logger:LoggerService,
    private diagnostic:Diagnostic,
    private alertController:AlertController,
    private actionController:ActionSheetController) {
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    this.logger.info(this, "SupportedVideoModes", this.mediaCapture.supportedVideoModes);
  }

  captureVideo() {
    this.logger.info(this, "captureVideo");
    this.authorizeVideo().then(
      (authorixed:boolean) => {
        this.showVideo()
      },
      (error:any) => {
        this.showVideoError()
      });
  }

  authorizeVideo():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "authorizeVideo");
      this.diagnostic.isMicrophoneAuthorized().then(
        (authorized:boolean) => {
          this.logger.info(this, "authorizeVideo", "isMicrophoneAuthorized", authorized);
          if (authorized) {
            resolve(true);
          }
          else {
            this.diagnostic.requestMicrophoneAuthorization().then(
              (status:string) => {
                this.logger.info(this, "authorizeVideo", "requestMicrophoneAuthorization", status);
                if (status == this.PERMISSION_GRANTED) {
                  resolve(true);
                }
                else if (status == this.PERMISSION_AUTHORIZED) {
                  resolve(true);
                }
                else {
                  reject();
                }
              },
              (error:any) => {
                this.logger.error(this, "authorizeVideo", "requestMicrophoneAuthorization", error);
                reject(error);
              });
          }
        },
        (error:any) => {
          this.logger.error(this, "authorizeVideo", "isMicrophoneAuthorized", error);
          reject(error);
        });
    });
  }

  showVideo() {
    let options:CaptureImageOptions = {
      limit: 3
    };
    return this.mediaCapture.captureVideo(options).then(
      (data:MediaFile[]) => {
        let mediaFile = data[0];
        this.logger.info(this, "captureVideo", mediaFile);
        this.copyFile(mediaFile.fullPath).then(
          (filePath:string) => {
            this.logger.info(this, "captureVideo", filePath);
            this.videoPath = filePath;
            this.resolveFile(filePath).then(
              (resourcePath:string) => {
                this.mimeType = mediaFile.type;
                this.videoPreview = this.sanitizer.bypassSecurityTrustUrl(resourcePath);
                // this.videoPreview = this.sanitizer.bypassSecurityTrustResourceUrl(resourcePath);
              },
              (error:any) => {
                this.mimeType = null;
                this.videoPreview = null;
              });
          },
          (error:any) => {
            this.logger.error(this, "captureVideo", error);
            this.videoPath = null;
            this.videoPreview = null;
          });
      },
      (error:CaptureError) => {
        this.logger.error(this, "captureVideo", error);
        this.videoPath = null;
        this.videoPreview = null;
        if (error.code && error.code.toString() == "3") {
          // IGNORE WHEN ONLY CANCELLED
        }
        else {
          let alert = this.alertController.create({
            title: 'Problem Taking Video',
            subTitle: "There was a problem trying to capture video.",
            buttons: ['OK']
          });
          alert.present();
        }
      }
    );
  }

  showVideoError() {
    let alert = this.alertController.create({
      title: 'Microphone Not Authorized',
      subTitle: "Please check your Settings to ensure Microphone is authorized.",
      buttons: [
        {
          text: 'Settings',
          handler: () => {
            this.diagnostic.switchToSettings();
          }
        },
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    alert.present();
  }

  deleteVideo() {
    this.logger.info(this, "deleteVideo");
    this.videoPath = null;
    this.videoPreview = null;
  }

  copyFile(filePath:string):Promise<string> {
    this.logger.info(this, "copyFile", filePath);
    return new Promise((resolve, reject) => {
      let sourceName = filePath.substr(filePath.lastIndexOf('/') + 1).split('?').shift();
      let sourceExtension = sourceName.substr(sourceName.lastIndexOf('.')).toLowerCase();
      let sourceDirectory = filePath.substr(0, filePath.lastIndexOf('/') + 1);
      if (sourceDirectory.startsWith("file://") == false) {
        sourceDirectory = "file://" + sourceDirectory;
      }
      let targetName = new Date().toISOString().replace(/\D/g,'') + sourceExtension;
      let targetDirectory = this.platform.is('ios') ? cordova.file.documentsDirectory : cordova.file.dataDirectory;
      this.logger.info(this, "copyFile", filePath, "sourceDirectory", sourceDirectory, "sourceName", sourceName, "targetDirectory", targetDirectory, "targetName", targetName);
      this.file.copyFile(sourceDirectory, sourceName, targetDirectory, targetName).then(
        (entry:Entry) => {
          this.logger.info(this, "copyFile", entry.nativeURL);
          resolve(entry.nativeURL);
        },
        (error:FileError) => {
          this.logger.error(this, "copyFile", error);
          reject(error.message);
        });
    });
  }

  resolveFile(filePath:string):Promise<string> {
    this.logger.info(this, "resolveFile", filePath);
    return new Promise((resolve, reject) => {
      this.file.resolveLocalFilesystemUrl(filePath).then(
        (fileEntry:FileEntry) => {
          this.logger.info(this, "resolveFile", filePath, fileEntry.toInternalURL());
          resolve(fileEntry.toInternalURL());
        },
        (error:FileError) => {
          this.logger.error(this, "resolveFile", filePath, error);
          reject(error.message);
        });
    });
  }

}
