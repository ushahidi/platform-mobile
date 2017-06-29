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
      let original = i18n;
      try {
        this.i18n = i18n;
        this.translate.use(i18n);
        this.translate.setDefaultLang(i18n);
        this.nativeStorage.setItem("i18n", i18n);
        resolve(i18n);
      }
      catch (error) {
        this.i18n = original;
        this.translate.use(original);
        this.translate.setDefaultLang(original);
        this.nativeStorage.setItem("i18n", original);
        reject(`Language ${i18n} Not Supported`);
      }
    });
  }

  get(key:string):string {
    return this.translate.instant(key);
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
