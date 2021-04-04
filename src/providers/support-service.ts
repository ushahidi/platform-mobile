import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { File, DirectoryEntry, Entry, FileEntry, FileWriter, DirectoryReader } from '@ionic-native/file';
import { NativeStorage } from '@ionic-native/native-storage';

import { Deployment } from '../models/deployment';
import { Post } from '../models/post';
import { Value } from '../models/value';
import { User } from '../models/user';
import { Form } from '../models/form';


import { DatabaseService } from '../providers/database-service';
import { LoggerService } from '../providers/logger-service';
import { writeToNodes } from 'ionic-angular/umd/components/virtual-scroll/virtual-util';

/*
 * Class containing useful methods for diagnostic and user support tasks
 */
@Injectable()
export class SupportService {

  constructor(
    protected file:File,
    protected logger:LoggerService,
    protected storage: NativeStorage,
    protected database:DatabaseService,
    protected platform:Platform) {
  }

  // Gets/creates support folder, locations where it will be found:
  // Android:
  //   Internal Storage > Android > data > com.ushahidi.mobile > files > support
  // iOS:
  //   Files > On My iPhone > Ushahidi > support
  protected supportFolder():Promise<DirectoryEntry> {
    var root:string;
    this.logger.info(this, 'supportFolder', 'Current platforms', this.platform.platforms());
    if (this.platform.is("android")) {
      // On Android, use the externalDataDirectory
      root = this.file.externalDataDirectory;
      this.logger.info(this, 'supportFolder', 'Platform is Android, setting root to', root);
    } else if (this.platform.is("ios")) {
      // On iOS, use documentsDirectory
      root = this.file.documentsDirectory;
      this.logger.info(this, 'supportFolder', 'Platform is iOS, setting root to', root);
    }
    return new Promise<DirectoryEntry>((resolve, reject) => {
      this.file.resolveDirectoryUrl(root).then(
        (entry) => entry.getDirectory('support',
          { create: true },
          (entry:DirectoryEntry) => resolve(entry),
          (err) => reject(err)
        )
      )
    });
  }

  protected supportFile(dir:DirectoryEntry, name:string):Promise<FileWriter> {
    return new Promise<FileWriter>((resolve, reject) => {
      this.supportFolder().then(
        (folder:DirectoryEntry) => {
          this.logger.info(this, 'supportFile', 'Got support folder at: ', folder);
          folder.getFile(name, {create: true, exclusive: true},
            (entry:FileEntry) => {
              entry.createWriter((w:FileWriter) => resolve(w), (err) => reject(err));
            }, (err) => reject(err))
      });
    });
  }

  protected supportFileRotate(folder:DirectoryEntry, name:string) {
    const KEEP_N_FILES = 20;
    folder.createReader().readEntries(
      (entries: Entry[]) => {
        let matches:Entry[] = entries.filter(
          (e:Entry) => e.name.match(new RegExp(`^${name}.\\d+.txt$`))
        );
        matches.sort(
          (a,b) => (a.name === b.name) ? 0 : (a.name < b.name) ? -1 : 1
        )
        if (matches.length > KEEP_N_FILES) {
          let toDelete:Entry[] = matches.slice(0, -KEEP_N_FILES);
          toDelete.forEach(
            (e:Entry) => e.remove(
              ()=>{},
              (err) => this.logger.info(this, 'supportFileRotate', err)
            ));
        }
      },
      (err) => this.logger.info(this, 'supportFileRotate', err)
    );
  }

  protected supportFileCreateRotate(name:string):Promise<FileWriter> {
    return this.supportFolder().then(
      (folder:DirectoryEntry) => {
        this.supportFileRotate(folder, name);
        let newName:string = `${name}.${new Date().getTime()}.txt`;
        return this.supportFile(folder, newName);
      });
  }

  // Create a dump of all pending posts for the different configured deployments
  public async dumpPendingPosts() {

    var filew:FileWriter;
    var write = async (s:string) => {
      if (!filew) {
        filew = await this.supportFileCreateRotate('pending-posts');
      }
      return new Promise<void>( (resolve, reject) => {
        filew.write(s);
        resolve();
      });
    };

    try {
      const deployments:Deployment[] = await this.database.getDeployments();
      for (const deployment of deployments) {
        const pending:Post[] = await this.database.getPostsPending(deployment);
        
        if (pending.length == 0)
          continue;

        const pendingWithValues:Post[] = 
          await Promise.all(
            pending.map(async (p) => {
              // Hydrate post
              let f:Form = await this.database.getFormWithAttributes(deployment, p.form_id);
              p.loadForm([f]);
              if (p.user_id) {
                let u:User = await this.database.getUser(deployment, p.user_id);
                p.loadUser([u]);
              }
              let v:Value[] = await this.database.getValues(deployment, p);
              p.loadValues(v);
              return p;
            }));
        
        let record:object = {
          _meta: {
            info: "Pending posts for configured deployment",
            when: new Date().toISOString()
          },
          deployment: deployment,
          posts: pendingWithValues
        }
        write(JSON.stringify(record) + '\n');
        this.logger.info(this, 'dumpPendingPosts', record);
      }
    } catch(e) {
      this.logger.error(this, 'dumpPendingPosts', 'Dumping posts', e);
    }
  }
}
