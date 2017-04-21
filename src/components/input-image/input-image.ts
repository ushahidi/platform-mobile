import { Component } from '@angular/core';
import { Platform, ActionSheetController, AlertController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, Entry, FileEntry, FileError } from '@ionic-native/file';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { FormGroup } from '@angular/forms';
import { Diagnostic } from '@ionic-native/diagnostic';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';

declare var cordova:any;

@Component({
  selector: 'input-image',
  templateUrl: 'input-image.html',
  inputs: ['value', 'attribute', 'formGroup', 'submitted']
})
export class InputImageComponent {

  PERMISSION_GRANTED:string = "granted";
  PERMISSION_AUTHORIZED:string = "authorized";
  ERROR_NO_IMAGE_SELECTED:string = "no image selected";
  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  imagePath: string = null;
  imageThumbnail: SafeResourceUrl = null;
  submitted: boolean = false;
  cameraPresent: boolean = true;
  caption:string = null;

  constructor(
    private file:File,
    private camera:Camera,
    private platform:Platform,
    private sanitizer:DomSanitizer,
    private logger:LoggerService,
    private diagnostic:Diagnostic,
    private alertController:AlertController,
    private actionController:ActionSheetController) {
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    this.diagnostic.isCameraPresent().then((cameraPresent:boolean) => {
      this.logger.info(this, "isCameraPresent", cameraPresent);
      this.cameraPresent = cameraPresent;
    })
  }

  showOptions() {
    let buttons = [];
    if (this.cameraPresent) {
      buttons.push({
        text: 'Take Photo',
        handler: () => {
          this.authorizeCamera().then(
            (authorized:boolean) => {
              this.showCamera()
            },
            (error:any) => {
              this.showCameraError()
            });
        }
      });
    }
    buttons.push({
      text: 'Photo Library',
      handler: () => {
        this.authorizeCameraRoll().then(
          (authorized:boolean) => {
            this.showCameraRoll()
          },
          (error:any) => {
            this.showCameraRollError()
          });
      }
    });
    buttons.push({
      text: 'Cancel',
      role: 'cancel'
    });
    let actionSheet = this.actionController.create({
      buttons: buttons
    });
    actionSheet.present();
  }

  authorizeCamera():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "authorizeCamera");
      this.diagnostic.isCameraAuthorized().then(
        (authorized:boolean) => {
          this.logger.info(this, "authorizeCamera", "isCameraAuthorized", authorized);
          if (authorized) {
            resolve(true);
          }
          else {
            this.diagnostic.requestCameraAuthorization().then(
              (status:string) => {
                this.logger.info(this, "authorizeCamera", "requestCameraAuthorization", status);
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
                this.logger.error(this, "authorizeCamera", "requestCameraAuthorization", error);
                reject(error);
              });
          }
        },
        (error:any) => {
          this.logger.error(this, "authorizeCamera", "isCameraAuthorized", error);
          reject(error);
        });
    });
  }

  showCamera() {
    this.logger.info(this, "showCamera");
    let options:CameraOptions = {
      targetWidth: 800,
      targetHeight: 600,
      encodingType: this.camera.EncodingType.JPEG,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI
    };
    return this.camera.getPicture(options).then(
      (data:string) => {
        this.logger.info(this, "showCamera", data);
        this.copyFile(data).then(
          (filePath:string) => {
            this.logger.info(this, "showCamera", filePath);
            this.imagePath = filePath;
            this.resolveFile(filePath).then(
              (resourcePath:string) => {
                this.imageThumbnail = this.sanitizer.bypassSecurityTrustUrl(resourcePath);
              },
              (error:any) => {
                this.imageThumbnail = null;
              });
          },
          (error:any) => {
            this.logger.error(this, "showCamera", error);
            this.imagePath = null;
            this.imageThumbnail = null;
          });
      },
      (error:any) => {
        this.logger.error(this, "showCamera", error);
        this.imagePath = null;
        this.imageThumbnail = null;
        if (error != this.ERROR_NO_IMAGE_SELECTED) {
          let alert = this.alertController.create({
            title: 'Problem Taking Photo',
            subTitle: "There was a problem trying to take a photo.",
            buttons: ['OK']
          });
          alert.present();
        }
      });
  }

  showCameraError() {
    let alert = this.alertController.create({
      title: 'Camera Not Authorized',
      subTitle: "Please check your Settings to ensure Camera is authorized.",
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
        }]
    });
    alert.present();
  }

  authorizeCameraRoll() {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "authorizeCameraRoll");
      this.diagnostic.isCameraRollAuthorized().then(
        (authorized:boolean) => {
          this.logger.info(this, "authorizeCameraRoll", "isCameraRollAuthorized", authorized);
          if (authorized) {
            resolve(true);
          }
          else {
            this.diagnostic.requestCameraRollAuthorization().then(
              (status:string) => {
                this.logger.info(this, "authorizeCameraRoll", "requestCameraRollAuthorization", status);
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
                this.logger.error(this, "authorizeCameraRoll", "requestCameraRollAuthorization", error);
                reject(error);
              });
          }
        },
        (error:any) => {
          this.logger.error(this, "authorizeCamera", "isCameraRollAuthorized", error);
          reject(error);
        });
    });
  }

  showCameraRoll() {
    this.logger.info(this, "showCameraRoll");
    let options:CameraOptions = {
      targetWidth: 800,
      targetHeight: 600,
      encodingType: this.camera.EncodingType.JPEG,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,
    };
    return this.camera.getPicture(options).then(
      (data:string) => {
        this.logger.info(this, "showCameraRoll", data);
        this.copyFile(data).then(
          (filePath:string) => {
            this.logger.info(this, "showCameraRoll", filePath);
            this.imagePath = filePath;
            this.resolveFile(filePath).then(
              (resourcePath:string) => {
                this.imageThumbnail = this.sanitizer.bypassSecurityTrustUrl(resourcePath);
              },
              (error:any) => {
                this.imageThumbnail = null;
              });
          },
          (error:any) => {
            this.logger.error(this, "showCameraRoll", error);
            this.imagePath = null;
            this.imageThumbnail = null;
          });
      },
      (error:any) => {
        this.logger.error(this, "showCameraRoll", error);
        this.imagePath = null;
        this.imageThumbnail = null;
        if (error != this.ERROR_NO_IMAGE_SELECTED) {
          let alert = this.alertController.create({
            title: 'Problem Choosing Photo',
            subTitle: "There was a problem trying to choose photo from the library.",
            buttons: ['OK']
          });
          alert.present();
        }
      });
  }

  showCameraRollError() {
    let alert = this.alertController.create({
      title: 'Photos Not Authorized',
      subTitle: "Please check your Settings to ensure Photos is authorized.",
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
        }]
    });
    alert.present();
  }

  deletePhoto() {
    this.logger.info(this, "deletePhoto");
    this.imagePath = null;
    this.imageThumbnail = null;
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
