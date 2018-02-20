import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Http } from '@angular/http';

import { File } from '@ionic-native/file';
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

  public loadSettings():Promise<Settings> {
    return new Promise((resolve, reject) => {
      let filepath = this.platform.is("ios")
        ? this.file.applicationDirectory + "www/assets/data/settings.json"
        : "../assets/data/settings.json";
      this.http.get(filepath)
        .map((res) => res.json())
        .subscribe((data) => {
          this.logger.info(this, "loadSettings", filepath, "Data", data);
          this.settings = <Settings>data
          resolve(this.settings);
        },
        (error) => {
          this.logger.error(this, "loadSettings", filepath, "Error", error);
          this.settings = null;
          reject("No Settings");
        });
    });
  }

  public getAcceptedTerms():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.getItem("AcceptedTerms").then((data:any) => {
        this.logger.info(this, "getAcceptedTerms", data);
        if (data === true || data === 'true') {
          resolve(true);
        }
        else {
          resolve(false);
        }
      },
      (error:any) => {
        this.logger.error(this, "getAcceptedTerms", error);
        resolve(false);
      });
    });
  }

  public setAcceptedTerms(accepted:boolean):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.setItem("AcceptedTerms", accepted).then((data:any) => {
        this.logger.info(this, "setAcceptedTerms", accepted, "Saved");
        resolve(true);
      },
      (error:any) => {
        this.logger.error(this, "setAcceptedTerms", accepted, error);
        resolve(false);
      });
    });
  }

  public getAppId():Promise<string> {
    return this.get('appId', 'com.ushahidi.mobile');
  }

  public getAppName():Promise<string> {
    return this.get('appName', 'Ushahidi');
  }

  public getAppDescription():Promise<string> {
    return this.get('appDescription', 'Ushahidi Mobile');
  }

  public getAppLanguages():Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.get('appLanguages', 'en,fr,es,de,pt,ru,nl,sw,ar,it,ht,jp,zh,vi').then((languages:string) => {
        if (languages && languages.length > 0) {
          resolve(languages.split(","));
        }
        resolve([]);
      });
    });
  }

  public getDeploymentUrl():Promise<string> {
    return this.get('deploymentUrl');
  }

  public getDeploymentEmail():Promise<string> {
    return this.get('deploymentEmail');
  }

  public getColorNavbar():Promise<string> {
    return this.get('colorNavbar', '#3F4751');
  }

  public getColorToolbar():Promise<string> {
    return this.get('colorToolbar', '#343434');
  }

  public getColorPrimary():Promise<string> {
    return this.get('colorPrimary', '#FDC245');
  }

  public getColorSecondary():Promise<string> {
    return this.get('colorSecondary', '#ADB6BF');
  }

  public getColorDark():Promise<string> {
    return this.get('colorDark', '#3F4751');
  }

  public getColorLight():Promise<string> {
    return this.get('colorLight', '#8793A2');
  }

  public getColorDanger():Promise<string> {
    return this.get('colorDanger', '#DD0000');
  }

  public getColorActive():Promise<string> {
    return this.get('colorActive', '#2F77B0');
  }

  public getColorHighlight():Promise<string> {
    return this.get('colorHighlight', '#F0F2F4');
  }

  public getSurveyFormAuthor():Promise<boolean> {
    return this.get('surveyFormAuthor', false);
  }

  public getSurveyFormTasks():Promise<boolean> {
    return this.get('surveyFormTasks', true);
  }

  private get(key:string, fallback:any=null):Promise<any> {
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
}
