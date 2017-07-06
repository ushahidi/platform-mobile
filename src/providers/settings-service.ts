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

  get(key:string):Promise<string> {
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

  getDeploymentUrl():Promise<string> {
    return this.get('deploymentUrl');
  }

}
