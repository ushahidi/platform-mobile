import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Device } from '@ionic-native/device';
import { IsDebug } from '@ionic-native/is-debug';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { SettingsService } from '../providers/settings-service';

@Injectable()
export class LoggerService {

  private development:boolean = true;
  private analytics:boolean = true;

  constructor(
    private device:Device,
    private isDebug:IsDebug,
    private platform:Platform,
    private settings:SettingsService,
    private googleAnalytics:GoogleAnalytics) {
    this.platform.ready().then(() => {
      this.isDebug.getIsDebug().then((development:boolean) => {
        this.development = development;
      },
      (error:any) => {
        this.development = false;
      });
      this.settings.getGoogleAnalytics().then((id:string) => {
        this.analytics = id && id.length > 0;
      },
      (error:any) => {
        this.analytics = false;
      })
    });
  }

  public log(instance:any, method:string, ...objects:any[]) {
    if (this.development) {
      console.log(this.message(instance, method, objects));
    }
  }

  public info(instance:any, method:string, ...objects:any[]) {
    if (this.development) {
      console.info(this.message(instance, method, objects));
    }
  }

  public debug(instance:any, method:string, ...objects:any[]) {
    if (this.development) {
      console.debug(this.message(instance, method, objects));
    }
  }

  public warn(instance:any, method:string, ...objects:any[]) {
    if (this.development) {
      console.warn(this.message(instance, method, objects));
    }
  }

  public view(instance:any, screen:string, campaign:string=null, session:boolean=false) {
    if (this.development) {
      console.log(this.message(instance, "view", [screen, campaign, session]));
    }
    else if (this.analytics) {
      this.googleAnalytics.trackView(screen, campaign, session).then((tracked) => {
        //Google Analytics view tracked
      },
      (error:any) => {
        //Google Analytics view failed
      });
    }
  }

  public event(instance:any, category:string, action:string, label:string, value:number=0, newSession:boolean=false) {
    if (this.development) {
      console.log(this.message(instance, "event", [category, action, label]));
    }
    else if (this.analytics) {
      this.googleAnalytics.trackEvent(category, action, label, value, newSession).then((tracked) => {
        //Google Analytics event tracked
      },
      (error:any) => {
        //Google Analytics event failed
      });
    }
  }

  public error(instance:any, method:string, ...objects:any[]) {
    if (this.development) {
      console.error(this.message(instance, method, objects));
    }
    else if (this.analytics) {
      let description = [];
      description.push(this.message(instance, method, objects));
      description.push(this.information());
      this.googleAnalytics.trackException(description.join("\n\n"), false).then((logged:any) => {
        //Google Analytics error tracked
      },
      (error:any) => {
        //Google Analytics error failed
      });
    }
  }

  public crash(instance:any, method:string, ...objects:any[]) {
    if (this.development) {
      console.error(this.message(instance, method, objects));
    }
    else if (this.analytics) {
      let description = [];
      description.push(this.message(instance, method, objects));
      description.push(this.information());
      this.googleAnalytics.trackException(description.join("\n\n"), true).then((logged:any) => {
        //Google Analytics crash tracked
      },
      (error:any) => {
        //Google Analytics crash failed
      });
    }
  }

  private information():string {
    let info = []
    if (this.device.manufacturer) {
      info.push(this.device.manufacturer);
    }
    if (this.device.platform) {
      info.push(this.device.platform);
    }
    if (this.device.version) {
      info.push(this.device.version);
    }
    if (this.device.model) {
      info.push(this.device.model);
    }
    return info.join(" ");
  }

  private message(instance:any, method:string, objects:any[]):string {
    let messages = [];
    if (instance != null) {
      messages.push(instance.constructor.name);
    }
    if (method != null) {
      messages.push(method);
    }
    if (objects && objects.length > 0) {
      for (let index in objects) {
        let object = objects[index];
        try {
          if (typeof object === 'string' || object instanceof String) {
            messages.push(object);
          }
          else {
            messages.push(JSON.stringify(object));
          }
        }
        catch(error) {
          messages.push(object);
        }
      }
    }
    return messages.join(" ");
  }

}
