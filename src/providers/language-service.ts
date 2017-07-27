import { Injectable } from '@angular/core';
import { Platform, Events } from 'ionic-angular';

import { TranslateService } from 'ng2-translate/ng2-translate';

import { NativeStorage } from '@ionic-native/native-storage';

export let LanguageChanged:string = "language:changed";

@Injectable()
export class LanguageService {

  i18n: string = null;
  direction: string = 'ltr';
  rtl:string [] = ['ar','arc','dv','fa','far','ha','he','khw','ks','ku','ps','ur','yi'];

  constructor(
    public events:Events,
    public platform:Platform,
    public storage:NativeStorage,
    public translate:TranslateService) {

  }

  getLanguage():Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.i18n) {
        resolve(this.i18n);
      }
      else {
        this.storage.getItem("i18n").then(
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
        this.direction = this.rtl.indexOf(i18n) > -1 ? 'rtl' : 'lrt';
        this.translate.use(i18n);
        this.translate.setDefaultLang(i18n);
        this.storage.setItem("i18n", i18n);
        this.events.publish(LanguageChanged, i18n);
        resolve(i18n);
      }
      catch (error) {
        this.i18n = original;
        this.direction = this.rtl.indexOf(original) > -1 ? 'rtl' : 'lrt';
        this.translate.use(original);
        this.translate.setDefaultLang(original);
        this.storage.setItem("i18n", original);
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

  get(key:string):string {
    return this.translate.instant(key);
  }

  getDirection():string {
    return this.rtl.indexOf(this.i18n) > -1 ? 'rtl' : 'lrt';
  }

}
