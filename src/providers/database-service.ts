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
    this.name = 'ushahidi.db';
    this.location = 'default';
    this.database = null;
    this.tables['deployments'] = {
      'id': 'INTEGER PRIMARY KEY AUTOINCREMENT',
      'url': 'TEXT',
      'name': 'TEXT',
      'domain': 'TEXT',
      'subdomain': 'TEXT',
      'status': 'TEXT',
      'description': 'TEXT',
      'image': 'TEXT',
      'username': 'TEXT',
      'password': 'TEXT',
      'token': 'TEXT',
      'refresh': 'TEXT'}
  }

  openDatabase() {
    console.log("Database openDatabase");
    return new Promise(resolve => {
      if (this.database) {
        console.log(`Database Cached ${JSON.stringify(this.database)}`);
        resolve(this.database);
      }
      else {
        let database = new SQLite();
        database.openDatabase({
          name: this.name,
          location: this.location
        }).then(
          () => {
            console.log(`Database Opened ${JSON.stringify(database)}`);
            this.database = database;
            resolve(database);
          },
          (err) => {
            console.error(`Database Failed ${JSON.stringify(err)}`);
            resolve(null);
          });
      }
    });
  }

  createTables() {
    console.log(`Database createTables`);
    return new Promise(resolve => {
      this.openDatabase().then((database:SQLite) => {
        let sql = [];
        for (var table in this.tables) {
          let columns = []
          let values = this.tables[table];
          for (var value in values) {
            columns.push(value + ' ' + values[value]);
          }
          sql.push(`CREATE TABLE IF NOT EXISTS ${table} (${columns.join(", ")})`);
        }
        database.sqlBatch(sql).
          then(() => {
            console.log(`Database Created ${sql}`);
            resolve(true);
          }).
          catch(() => {
            console.error(`Database Failed ${sql}`);
            resolve(null);
          });
      });
    });
  }

  addDeployment(json:{}) {
    console.log(`Database addDeployment ${JSON.stringify(json)}`);
    if (json['name'] == null) {
      json['name'] = json['deployment_name'];
    }
    if (json['url'] == null) {
      json['url'] = `https://${json['subdomain']}.${json['domain']}`;
    }
    return this.executeInsert("deployments", json);
  }

  getDeployments() {
    return this.executeSelect("deployments");
  }

  updateDeployment(id:string, json:{}) {
    return this.executeUpdate("deployments", id, json);
  }

  executeUpdate(table:string, id:string, json:{}) {
    return new Promise(resolve => {
      this.openDatabase().then((database:SQLite) => {
        let statement = this.updateStatement(table, id, json);
        let parameters = this.updateParameters(table, id, json);
        console.log(`Database Updating ${statement} ${parameters}`);
        database.executeSql(statement, parameters)
          .then(
            () => {
              console.log(`Database Updated ${statement} ${parameters}`);
              resolve(true);
            })
          .catch(
            () => {
              console.error(`Database Failed ${statement} ${parameters}`);
              resolve(false);
            });
      });
    });
  }

  executeSelect(table:string) {
    return new Promise(resolve => {
      this.openDatabase().then((database:SQLite) => {
        let sql = `SELECT * FROM ${table}`;
        database.executeSql(sql, []).then(data => {
          if (data.rows.length > 0) {
            let results = [];
            let columns = this.tables[table];
            for (let i = 0; i < data.rows.length; i++) {
              let row = data.rows.item(i);
              let result = {};
              for (var column in columns) {
                if (row[column]) {
                  result[column] = row[column];
                }
              }
              results.push(result);
            }
            console.log(`Database Selected ${sql} ${JSON.stringify(results)}`);
            resolve(results);
          }
          else {
            console.log(`Database Selected ${sql} []`);
            resolve([]);
          }
        });
      });
    });
  }

  executeInsert(table:string, json:{}) {
    return new Promise(resolve => {
      this.openDatabase().then((database:SQLite) => {
        let columns = this.tables[table];
        let statement = this.insertStatement(table, columns, json);
        let parameters = this.insertParameters(table, columns, json);
        console.log(`Database Inserting ${statement} ${parameters}`);
        database.executeSql(statement, parameters)
          .then(
            () => {
              console.log(`Database Inserted ${statement} ${parameters}`);
              resolve(true);
            })
          .catch(
            () => {
              console.error(`Database Failed ${statement} ${parameters}`);
              resolve(false);
            });
      });
    });
  }

  insertStatement(table, columns, values) : string {
    let names = [];
    let params = [];
    for (var column in columns) {
      if (values[column]) {
        names.push(column);
        params.push("?");
      }
    }
    return `INSERT INTO ${table} (${names.join(", ")}) VALUES (${params.join(", ")})`;
  }

  insertParameters(table, columns, values) : any {
    let params = [];
    for (var column in columns) {
      if (values[column]) {
        params.push(values[column]);
      }
    }
    return params;
  }

  updateStatement(table:string, id:string, values:{}) : string {
    let params = [];
    for (var value in values) {
      params.push(`${value} = ?`);
    }
    return `UPDATE ${table} SET ${params.join(", ")} WHERE id = ${id}`;
  }

  updateParameters(table:string, id:string, values:{}) : any {
    let params = [];
    for (var value in values) {
      if (values[value]) {
        params.push(values[value]);
      }
    }
    return params;
  }

}
