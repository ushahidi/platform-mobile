import { Component } from '@angular/core';
import { Platform, ActionSheetController, AlertController, normalizeURL } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, Entry, FileEntry, FileError } from '@ionic-native/file';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { FormGroup } from '@angular/forms';

import { Device } from '@ionic-native/device';
import { Diagnostic } from '@ionic-native/diagnostic';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';

import { LoggerService } from '../../providers/logger-service';
import { LanguageService } from '../../providers/language-service';

@Component({
  selector: 'input-image',
  templateUrl: 'input-image.html',
  inputs: ['value', 'attribute', 'formGroup', 'submitted']
})
export class InputImageComponent {

  PERMISSION_GRANTED:string = "granted";
  PERMISSION_AUTHORIZED:string = "authorized";
  NO_IMAGE_SELECTED:string = "no image selected";
  CAMERA_CANCELLED:string = "Camera cancelled.";
  SELECTION_CANCELLED:string = "Selection cancelled.";
  formGroup:FormGroup;
  attribute:Attribute = null;
  value:Value = null;
  imagePath:string = null;
  imageThumbnail:SafeResourceUrl = null;
  submitted:boolean = false;
  cameraPresent:boolean = true;
  caption:string = null;

  constructor(
    private file:File,
    private camera:Camera,
    private device:Device,
    private platform:Platform,
    private sanitizer:DomSanitizer,
    private logger:LoggerService,
    private diagnostic:Diagnostic,
    private language:LanguageService,
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
    this.language.getTranslations([
      'IMAGE_TAKE_PHOTO',
      'IMAGE_PHOTO_LIBRARY',
      'ACTION_CANCEL']).then((translations:string[]) => {
        let buttons = [];
        if (this.cameraPresent) {
          buttons.push({
            text: translations[0],
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
          text: translations[1],
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
          text: translations[2],
          role: 'cancel'
        });
        let actionSheet = this.actionController.create({
          buttons: buttons
        });
        actionSheet.present();
    });
  }

  authorizeCamera():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "authorizeCamera");
      if (this.device.platform == 'ios') {
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
      }
      else {
        resolve(true);
      }
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
        if (error == this.NO_IMAGE_SELECTED) {
          //IGNORE NO_IMAGE_SELECTED
        }
        else if (error == this.CAMERA_CANCELLED) {
            //IGNORE CAMERA_CANCELLED
        }
        else {
          this.language.getTranslations([
            'IMAGE_TAKE_PHOTO_ERROR',
            'IMAGE_TAKE_PHOTO_PROBLEM',
            'ACTION_OK']).then((translations:string[]) => {
              let alert = this.alertController.create({
                title: translations[0],
                subTitle: translations[1],
                buttons: [translations[2]]
              });
              alert.present();
          });
        }
      });
  }

  showCameraError() {
    this.language.getTranslations([
      'IMAGE_TAKE_PHOTO_AUTHORIZE',
      'IMAGE_TAKE_PHOTO_AUTHORIZE_DESCRIPTION',
      'ACTION_SETTINGS',
      'ACTION_OK']).then((translations:string[]) => {
        let alert = this.alertController.create({
          title: translations[0],
          subTitle: translations[1],
          buttons: [
            {
              text: translations[2],
              handler: () => {
                this.diagnostic.switchToSettings().then(() => {
                  this.logger.info(this, "showCameraError", "switchToSettings");
                });
              }
            },
            {
              text: translations[3],
              role: 'cancel'
            }]
        });
        alert.present();
    });
  }

  authorizeCameraRoll() {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "authorizeCameraRoll");
      if (this.device.platform == 'ios') {
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
      }
      else {
        resolve(true);
      }
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
        if (error == this.NO_IMAGE_SELECTED) {
          //IGNORE NO_IMAGE_SELECTED
        }
        else if (error == this.SELECTION_CANCELLED) {
            //IGNORE SELECTION_CANCELLED
        }
        else {
          this.language.getTranslations([
            'IMAGE_PHOTO_LIBRARY_ERROR',
            'IMAGE_PHOTO_LIBRARY_PROBLEM',
            'ACTION_OK']).then((translations:string[]) => {
              let alert = this.alertController.create({
                title: translations[0],
                subTitle: translations[1],
                buttons: [translations[2]]
              });
              alert.present();
          });
        }
      });
  }

  showCameraRollError() {
    this.language.getTranslations([
      'IMAGE_PHOTO_LIBRARY_AUTHORIZE',
      'IMAGE_PHOTO_LIBRARY_AUTHORIZE_DESCRIPTION',
      'ACTION_SETTINGS',
      'ACTION_OK']).then((translations:string[]) => {
        let alert = this.alertController.create({
          title: translations[0],
          subTitle: translations[1],
          buttons: [
            {
              text: translations[2],
              handler: () => {
                this.diagnostic.switchToSettings().then(() => {
                  this.logger.info(this, "showCameraError", "switchToSettings");
                });
              }
            },
            {
              text: translations[3],
              role: 'cancel'
            }]
        });
        alert.present();
    });
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
      let targetDirectory = this.platform.is('ios') ? this.file.documentsDirectory : this.file.dataDirectory;
      this.logger.info(this, "copyFile", filePath, "sourceDirectory", sourceDirectory, "sourceName", sourceName, "targetDirectory", targetDirectory, "targetName", targetName);
      this.file.copyFile(sourceDirectory, sourceName, targetDirectory, targetName).then((entry:Entry) => {
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
      this.file.resolveLocalFilesystemUrl(filePath).then((fileEntry:FileEntry) => {
        let normalizedURL = this.platform.is("ios")
          ? normalizeURL(fileEntry.toURL())
          : normalizeURL(fileEntry.toInternalURL());
        this.logger.info(this, "resolveFile", filePath, normalizedURL);
        resolve(normalizedURL);
      },
      (error:FileError) => {
        this.logger.error(this, "resolveFile", filePath, error);
        reject(error.message);
      });
    });
  }

}
