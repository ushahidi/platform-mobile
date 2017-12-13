import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Http } from '@angular/http';

import { File, Entry, FileEntry, FileError, Metadata } from '@ionic-native/file';
import { NativeStorage } from '@ionic-native/native-storage';

import { Settings } from '../models/settings';

import { LoggerService } from '../providers/logger-service';

@Injectable()
export class SettingsService {

  settings: Settings = null;

  constructor(
    protected file:File,
    protected http:Http,
    protected platform:Platform,
    protected logger:LoggerService,
    protected storage:NativeStorage) {

  }

  loadSettings():Promise<Settings> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadSettings");
      let directory = "assets/data";
      let settings = "settings.json";
      this.file.checkFile(directory, settings).then((exists:boolean) => {
        if (exists) {
          this.http.get(directory + "/" + settings)
            .map((res) => res.json())
            .subscribe((data) => {
              this.logger.info(this, "loadSettings", data);
              this.settings = <Settings>data
              resolve(this.settings);
            });
        }
        else {
          this.logger.error(this, "No Settings");
          reject("No Settings");
        }
      },
      (error:any) => {
        this.logger.error(this, "No Settings", error);
        reject("No Settings");
      });
    });
  }

  getAcceptedTerms():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.getItem("AcceptedTerms").then((data:any) => {
        this.logger.info(this, "getAcceptedTerms", data);
        if (data == true || data == 'true') {
          resolve(true);
        }
        else {
          resolve(false);
        }
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  setAcceptedTerms(accepted:boolean):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "setAcceptedTerms", accepted);
      this.storage.setItem("AcceptedTerms", accepted).then((data:any) => {
        resolve(true);
      },
      (error:any) => {
        resolve(false);
      });
    });
  }

  get(key:string, fallback:any=null):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.settings) {
        let value = this.settings[key];
        if (value) {
          resolve(value);
        }
        else if (fallback != null) {
          resolve(fallback);
        }
        else {
          reject(`Settings ${key} Not Found`);
        }
      }
      else {
        this.loadSettings().then((settings:Settings) => {
          let value = settings[key];
          if (value) {
            resolve(value);
          }
          else if (fallback != null) {
            resolve(fallback);
          }
          else {
            reject(`Settings ${key} Not Found`);
          }
        },
        (error:any) => {
          if (fallback != null) {
            resolve(fallback);
          }
          else {
            reject(`Settings ${key} Not Found`);
          }
        });
      }
    });
  }

  getAppId():Promise<string> {
    return this.get('appId', 'com.ushahidi.mobile');
  }

  getAppName():Promise<string> {
    return this.get('appName', 'Ushahidi');
  }

  getAppDescription():Promise<string> {
    return this.get('appDescription', 'Ushahidi Mobile');
  }

  getAppLanguages():Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.get('appLanguages', 'en,fr,es,de').then((languages:string) => {
        if (languages && languages.length > 0) {
          resolve(languages.split(","));
        }
        resolve([]);
      });
    });
  }

  getDeploymentUrl():Promise<string> {
    return this.get('deploymentUrl');
  }

  getDeploymentEmail():Promise<string> {
    return this.get('deploymentEmail');
  }

  getColorNavbar():Promise<string> {
    return this.get('colorNavbar', '#3F4751');
  }

  getColorToolbar():Promise<string> {
    return this.get('colorToolbar', '#343434');
  }

  getColorPrimary():Promise<string> {
    return this.get('colorPrimary', '#FDC245');
  }

  getColorSecondary():Promise<string> {
    return this.get('colorSecondary', '#ADB6BF');
  }

  getColorDark():Promise<string> {
    return this.get('colorDark', '#3F4751');
  }

  getColorLight():Promise<string> {
    return this.get('colorLight', '#8793A2');
  }

  getColorDanger():Promise<string> {
    return this.get('colorDanger', '#DD0000');
  }

  getColorActive():Promise<string> {
    return this.get('colorActive', '#2F77B0');
  }

  getColorHighlight():Promise<string> {
    return this.get('colorHighlight', '#F0F2F4');
  }

  getSurveyFormAuthor():Promise<boolean> {
    return this.get('surveyFormAuthor', false);
  }

  getSurveyFormTasks():Promise<boolean> {
    return this.get('surveyFormTasks', true);
  }
}
