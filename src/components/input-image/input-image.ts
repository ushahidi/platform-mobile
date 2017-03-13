import { Component } from '@angular/core';
import { Platform, ActionSheetController, AlertController } from 'ionic-angular';
import { Camera, File, Entry, FileError } from 'ionic-native';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { FormGroup } from '@angular/forms';

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

  formGroup: FormGroup;
  attribute: Attribute = null;
  value: Value = null;
  imagePath: string = null;
  imageThumbnail: SafeResourceUrl = null;
  submitted: boolean = false;

  constructor(
    public platform:Platform,
    public sanitizer:DomSanitizer,
    public logger:LoggerService,
    public alertController:AlertController,
    public actionController:ActionSheetController) {
  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
  }

  showOptions() {
    let actionSheet = this.actionController.create({
      buttons: [
        {
          text: 'Take Photo',
          handler: () => {
            this.takePhoto();
          }
        },
        {
          text: 'Photo Library',
          handler: () => {
            this.choosePhoto();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  takePhoto() {
    this.logger.info(this, "takePhoto");
    let options = {
      targetWidth: 800,
      targetHeight: 600,
      encodingType: Camera.EncodingType.JPEG,
      sourceType: Camera.PictureSourceType.CAMERA,
      destinationType: Camera.DestinationType.FILE_URI
    };
    Camera.getPicture(options).then(
      (data:string) => {
        this.logger.info(this, "choosePhoto", data);
        this.copyFile(data).then(
          (filePath:string) => {
            this.logger.info(this, "choosePhoto", filePath);
            this.imagePath = filePath;
            this.imageThumbnail = this.sanitizer.bypassSecurityTrustResourceUrl(filePath);
          },
          (error) => {
            this.logger.error(this, "choosePhoto", error);
            this.imagePath = null;
            this.imageThumbnail = null;
          });
      },
      (error) => {
        this.logger.error(this, "choosePhoto", error);
        this.imagePath = null;
        this.imageThumbnail = null;
        let alert = this.alertController.create({
          title: 'Problem Taking Photo',
          subTitle: "There was a problem trying to take a photo.",
          buttons: ['OK']
        });
        alert.present();
      });
  }

  choosePhoto() {
    this.logger.info(this, "choosePhoto");
    let options = {
      targetWidth: 800,
      targetHeight: 600,
      encodingType: Camera.EncodingType.JPEG,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: Camera.DestinationType.FILE_URI,
    };
    Camera.getPicture(options).then(
      (data:string) => {
        this.logger.info(this, "choosePhoto", data);
        this.copyFile(data).then(
          (filePath:string) => {
            this.logger.info(this, "choosePhoto", filePath);
            this.imagePath = filePath;
            this.imageThumbnail = this.sanitizer.bypassSecurityTrustResourceUrl(filePath);
          },
          (error) => {
            this.logger.error(this, "choosePhoto", error);
            this.imagePath = null;
            this.imageThumbnail = null;
          });
      },
      (error) => {
        this.logger.error(this, "choosePhoto", error);
        this.imagePath = null;
        this.imageThumbnail = null;
        let alert = this.alertController.create({
          title: 'Problem Choosing Photo',
          subTitle: "There was a problem trying to choose photo from the library.",
          buttons: ['OK']
        });
        alert.present();
      });
  }

  deletePhoto() {
    this.logger.info(this, "deletePhoto");
    this.imagePath = null;
    this.imageThumbnail = null;
  }

  copyFile(filePath:string){
    return new Promise((resolve, reject) => {
      let fileName = filePath.substr(filePath.lastIndexOf('/') + 1).split('?').shift();
      let fileDirectory = filePath.substr(0, filePath.lastIndexOf('/') + 1);
      let storeDirectory = this.platform.is('ios') ? cordova.file.documentsDirectory : cordova.file.dataDirectory;
      let storePath = `${storeDirectory}${fileName}`;
      this.logger.info(this, "copyFile", fileDirectory, fileName, storeDirectory);
      File.checkFile(storeDirectory, fileName).then(
        (exists) => {
          if (exists == true) {
            this.logger.info(this, "copyFile", "Exists", storePath);
            resolve(storePath);
          }
          else {
            File.copyFile(fileDirectory, fileName, storeDirectory, fileName).then(
              (entry:Entry) => {
                this.logger.info(this, "copyFile", entry.fullPath, storePath);
                resolve(storePath);
              },
              (error:FileError) => {
                reject(error);
              });
          }
        },
        (error:FileError) => {
          this.logger.info(this, "checkFile", "checkFile", error);
          File.copyFile(fileDirectory, fileName, storeDirectory, fileName).then(
            (entry:Entry) => {
              this.logger.info(this, "copyFile", entry.fullPath, storePath);
              resolve(storePath);
            },
            (error:FileError) => {
              reject(error);
            });
        });
    });
  }

}
