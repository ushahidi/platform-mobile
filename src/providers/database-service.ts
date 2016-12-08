import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite } from 'ionic-native';

@Injectable()
export class DatabaseService {

  name: string;
  location: string;
  database : SQLite;
  tables : any = {};

  constructor(public platform:Platform) {
    console.log('Database Service Provider');
    this.name = 'ushahidi.db';
    this.location = 'default';
    this.database = null;
    this.tables['deployments'] = {
      'id': 'INTEGER PRIMARY KEY',
      'url': 'TEXT',
      'name': 'TEXT',
      'domain': 'TEXT',
      'subdomain': 'TEXT',
      'status': 'TEXT',
      'deployment_name': 'TEXT',
      'description': 'TEXT',
      'image': 'TEXT'}
  }

  openDatabase() {
    console.log("Database openDatabase");
    return new Promise(resolve => {
      if (this.database) {
        console.log('Database Cached');
        resolve(this.database);
      }
      else {
        SQLite.openDatabase({
          name: this.name,
          location: this.location
        }).then(
          (database:SQLite) => {
            console.log('Database Opened');
            this.database = database;
            for (var table in this.tables) {
              let columns = []
              let values = this.tables[table];
              for (var value in values) {
                columns.push(value + ' ' + values[value]);
              }
              let sql = `CREATE TABLE IF NOT EXISTS ${table} (${columns.join()})`;
              console.log(`Database Executing ${sql}`);
              database.executeSql(sql, null).
                then(() => {
                  console.log(`Database Executed ${sql}`);
                }).
                catch(() => {
                  console.log(`Database Failed ${sql}`);
                });
            }
            resolve(database);
          },
          (err) => {
            console.error('Database Failed', err);
            resolve(null);
          });
      }
    });
  }

  addDeployment(json:{}) {
    console.log(`Database addDeployment ${JSON.stringify(json)}`)
    return new Promise(resolve => {
      this.openDatabase().then((database:SQLite) => {
        console.log(`Database addDeployment openDatabase`);
        resolve(true);
      })
    });
  }

}
