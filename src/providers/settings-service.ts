import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Http } from '@angular/http';

import { Settings } from '../models/settings';

import { LoggerService } from '../providers/logger-service';

@Injectable()
export class SettingsService {

  settings: Settings = null;

  constructor(
    protected http:Http,
    protected platform:Platform,
    protected logger:LoggerService) {

  }

  loadSettings():Promise<Settings> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadSettings");
      this.http.get("assets/data/settings.json")
        .map((res) => res.json())
        .subscribe((data) => {
          this.logger.info(this, "loadSettings", data);
          this.settings = <Settings>data
          resolve(this.settings);
        });
    });
  }

  get(key:string):Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.settings) {
        let value = this.settings[key];
        if (value) {
          resolve(value);
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
          else {
            reject(`Settings ${key} Not Found`);
          }
        });
      }
    });
  }

  getAppId():Promise<string> {
    return this.get('appId');
  }

  getAppName():Promise<string> {
    return this.get('appName');
  }

  getAppDescription():Promise<string> {
    return this.get('appDescription');
  }

  getAppLanguages():Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.get('appLanguages').then((languages:string) => {
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
    return this.get('colorNavbar');
  }

  getColorToolbar():Promise<string> {
    return this.get('colorToolbar');
  }

  getColorPrimary():Promise<string> {
    return this.get('colorPrimary');
  }

  getColorSecondary():Promise<string> {
    return this.get('colorSecondary');
  }

  getColorDark():Promise<string> {
    return this.get('colorDark');
  }

  getColorLight():Promise<string> {
    return this.get('colorLight');
  }

  getColorDanger():Promise<string> {
    return this.get('colorDanger');
  }

  getColorActive():Promise<string> {
    return this.get('colorActive');
  }

  getColorHighlight():Promise<string> {
    return this.get('colorHighlight');
  }

  getUserSignupPhone():Promise<boolean> {
    return this.get('userSignupPhone');
  }

  getSurveyFormAuthor():Promise<boolean> {
    return this.get('surveyFormAuthor');
  }
}
