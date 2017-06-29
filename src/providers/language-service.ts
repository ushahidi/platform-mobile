import { Injectable } from '@angular/core';
import { Platform, Events } from 'ionic-angular';

import { TranslateService } from 'ng2-translate/ng2-translate';

import { NativeStorage } from '@ionic-native/native-storage';

@Injectable()
export class LanguageService {

  i18n: string = null;

  constructor(
    public events:Events,
    public platform:Platform,
    public nativeStorage: NativeStorage,
    public translate:TranslateService) {

  }

  getLanguage():Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.i18n) {
        resolve(this.i18n);
      }
      else {
        this.nativeStorage.getItem("i18n").then(
          (i18n) => {
            resolve(i18n);
          },
          (error) => {
            reject();
          });
      }
    });
  }

  setLanguage(i18n:string):Promise<string> {
    return new Promise((resolve, reject) => {
      if (i18n === 'en' || i18n === 'ar' || i18n === 'fa' || i18n === 'fr' || i18n === 'es') {
        this.i18n = i18n;
        this.translate.use(i18n);
        this.translate.setDefaultLang(i18n);
        this.nativeStorage.setItem("i18n", i18n);
        resolve(i18n);
      }
      else {
        reject(`Language ${i18n} Not Supported`);
      }
    });
  }

  getTranslation(key:string):Promise<string> {
    return new Promise((resolve, reject) => {
      this.translate.get(key).subscribe(
        (value) => {
          resolve(value);
        },
        (error) => {
          reject();
        });
    });
  }

  getTranslations(keys:string[]):Promise<string[]> {
    return new Promise((resolve, reject) => {
      let translations = [];
      for (let key of keys) {
        translations.push(this.translate.get(key));
      }
      Promise.all(translations).then(
        (phrases:any) => {
          let results = [];
          for (let phrase of phrases) {
            results.push(phrase.value);
          }
          resolve(results);
        },
        (error:any) => {
          reject(error);
        });
    });
  }

}
