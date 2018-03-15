import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { NativeStorage } from '@ionic-native/native-storage';

import { Settings } from '../models/settings';

import * as SETTINGS from "../assets/data/settings.json";

@Injectable()
export class SettingsService {

  private settings: Settings = null;

  constructor(
    protected platform:Platform,
    protected storage:NativeStorage) {

  }

  public getAcceptedTerms():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.getItem("AcceptedTerms").then((data:any) => {
        if (data === true || data === 'true') {
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

  public setAcceptedTerms(accepted:boolean):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.setItem("AcceptedTerms", accepted).then(() => {
        resolve(true);
      },
      (error:any) => {
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

  public getGoogleAnalytics():Promise<string> {
    return this.get('googleAnalytics', '');
  }

  private get(key:string, fallback:any=null):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.settings == null) {
        this.settings = <Settings>SETTINGS;
      }
      let value = this.settings[key];
      if (value != null) {
        resolve(value);
      }
      else if (fallback != null) {
        resolve(fallback);
      }
      else {
        reject(`Settings ${key} Not Found`);
      }
    });
  }
}
