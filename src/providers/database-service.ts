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
      'access_token': 'TEXT',
      'refresh_token': 'TEXT'}
    this.tables['posts'] = {
      'id': 'INTEGER PRIMARY KEY AUTOINCREMENT',
      'deployment': 'INTEGER',
      'title': 'TEXT',
      'content': 'TEXT',
      'slug': 'TEXT',
      'type': 'TEXT',
      'color': 'TEXT',
      'message': 'TEXT',
      'created': 'TEXT',
      'updated': 'TEXT',
      'image': 'TEXT',
      'latitude': 'DOUBLE',
      'longitude': 'DOUBLE'}
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

  addDeployment(data:{}) {
    console.log(`Database addDeployment ${JSON.stringify(data)}`);
    data['name'] = data['deployment_name'];
    data['url'] = `https://${data['subdomain']}.${data['domain']}`;
    return this.executeInsert("deployments", data);
  }

  getDeployments() {
    return this.executeSelect("deployments");
  }

  getDeployment(id:number) {
    return this.executeSelect("deployments", {"id": id});
  }

  updateDeployment(id:string, data:{}) {
    return this.executeUpdate("deployments", id, data);
  }

  getPosts(deployment:number) {
    return this.executeSelect("posts", {"deployment": deployment});
  }

  getPost(deployment:number, post:number) {
    return this.executeSelect("posts", {"deployment": deployment, "id": post});
  }

  addPost(deployment:number, data:{}) {
    console.log(`Database addPost Deployment ${deployment} ${JSON.stringify(data)}`);
    data['deployment'] = deployment;
    if (data['values']['location_default']) {
      let location = data['values']['location_default'][0];
      data['latitude'] = location['lat'];
      data['longitude'] = location['lon'];
    }
    return Promise.all([
      this.executeUpdate("posts", data['id'], data),
      this.executeInsert("posts", data)]);
  }

  executeSelect(table:string, where:{}=null) {
    return new Promise(resolve => {
      this.openDatabase().then((database:SQLite) => {
        let sql = `SELECT * FROM ${table}`;
        if (where != null) {
          let clause = [];
          for (let column in where) {
            clause.push(`${column} = ${where[column]}`);
          }
          sql = `SELECT * FROM ${table} WHERE ${clause.join(', ')}`;
        }
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

  executeInsert(table:string, data:{}) {
    return new Promise(resolve => {
      this.openDatabase().then((database:SQLite) => {
        let columns = this.tables[table];
        let statement = this.insertStatement(table, columns, data);
        let parameters = this.insertParameters(table, columns, data);
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

  executeUpdate(table:string, id:string, data:{}) {
    return new Promise(resolve => {
      this.openDatabase().then((database:SQLite) => {
        let columns = this.tables[table];
        let statement = this.updateStatement(table, columns, id, data);
        let parameters = this.updateParameters(table, columns, id, data);
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

  insertStatement(table, columns, values) : string {
    let names = [];
    let params = [];
    for (var column in columns) {
      if (values[column]) {
        names.push(column);
        params.push("?");
      }
    }
    return `INSERT OR IGNORE INTO ${table} (${names.join(", ")}) VALUES (${params.join(", ")})`;
  }

  insertParameters(table:string, columns:{}, values:{}) : any {
    let params = [];
    for (var column in columns) {
      if (values[column]) {
        let type = columns[column];
        if (type == 'TEXT') {
          params.push(values[column].toString());
        }
        else {
          params.push(values[column]);
        }
      }
    }
    return params;
  }

  updateStatement(table:string, columns:{}, id:string, values:{}) : string {
    let params = [];
    for (var column in columns) {
      if (values[column]) {
        params.push(`${column} = ?`);
      }
    }
    return `UPDATE OR IGNORE ${table} SET ${params.join(", ")} WHERE id = ${id}`;
  }

  updateParameters(table:string, columns:{}, id:string, values:{}) : any {
    let params = [];
    for (var column in columns) {
      if (values[column]) {
        let type = columns[column];
        if (type == 'TEXT') {
          params.push(values[column].toString());
        }
        else {
          params.push(values[column]);
        }
      }
    }
    return params;
  }

}
