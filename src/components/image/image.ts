import { Component, ViewChild } from '@angular/core';
import { Button, ActionSheetController, AlertController } from 'ionic-angular';
import { Camera } from 'ionic-native';

@Component({
  selector: 'field-image',
  templateUrl: 'image.html',
  inputs: ['attribute']
})
export class ImageComponent {

  attribute: any = {};
  imageData: string = null;
  imagePlaceholder: string;

  @ViewChild('button') button: Button;

  constructor(
    public alertController:AlertController,
    public actionController:ActionSheetController) {
    this.imagePlaceholder = "/assets/images/placeholder-photo.jpg";
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

  choosePhoto() {
    let options = {
      targetWidth: 800,
      targetHeight: 600,
      encodingType: Camera.EncodingType.JPEG,
      sourceType: Camera.PictureSourceType.CAMERA,
      destinationType: Camera.DestinationType.DATA_URL
    };
    Camera.getPicture(options).then (
      (data) => {
        this.imageData = "data:image/jpeg;base64," + data;
      },
      (error) => {
        console.error(`Camera Choose Photo ${JSON.stringify(error)}`);
        let alert = this.alertController.create({
          title: 'Problem Choosing Photo',
          subTitle: "There was a problem trying to choose photo from the library.",
          buttons: ['OK']
        });
        alert.present();
      });
  }

  takePhoto() {
    let options = {
      targetWidth: 800,
      targetHeight: 600,
      encodingType: Camera.EncodingType.JPEG,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: Camera.DestinationType.DATA_URL,
    };
    Camera.getPicture(options).then(
      (data) => {
        this.imageData = "data:image/jpeg;base64," + data;
      },
      (error) => {
        console.error(`Camera Take Photo ${JSON.stringify(error)}`);
        let alert = this.alertController.create({
          title: 'Problem Taking Photo',
          subTitle: "There was a problem trying to take a photo.",
          buttons: ['OK']
        });
        alert.present();
      });
  }
}
