import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { NativeStorage, SecureStorage, SQLite } from 'ionic-native';

@Injectable()
export class DatabaseService {

  database : SQLite;

  constructor(public platform:Platform) {
    console.log('Database Service Provider');
  }

  openDatabase() {
    console.log("API openDatabase");
    this.database = new SQLite();
    this.database.openDatabase({
      name: 'ushahidi.db',
      location: 'default'
    }).then(
      () => {
        console.log('API openDatabase Opened');
      },
      (err) => {
        console.error('API openDatabase Failed', err);
      });
  }
}
