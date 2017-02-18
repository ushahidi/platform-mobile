import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { HttpService } from '../providers/http-service';
import { LoggerService } from '../providers/logger-service';

@Injectable()
export class VimeoService extends HttpService {

  private accessToken: string = "413e6801c73e70fec5e1468249a114e5";
  //private accessToken: string = "74b4152349da27210ee8278380926b84";

  constructor(
    public http: Http,
    public logger:LoggerService) {
    super(http, logger);
  }

  createTicket(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = "https://api.vimeo.com/me/videos";
      let params = { type:"streaming" };
      this.httpPost(url, this.accessToken, params).then(
        (data) => {
          this.logger.info(this, "createTicket", data);
          resolve(data);
        },
        (error) => {
          reject(error);
        })
    });
  }

  uploadVideo(url:string, file:any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "uploadVideo", url, file);
      this.fileUpload(url, this.accessToken, file, "PUT", "video/quicktime", "application/vnd.vimeo.*+json;version=3.2").then(
        (data) => {
          this.logger.info(this, "uploadVideo", url, file, data);
          resolve(data);
        },
        (error) => {
          reject(error);
        })
    });
  }

  updateVideo(video:string, name:string=null, description:string=null): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `https://api.vimeo.com/videos/${video}`;
      let params = {
        'name': name,
        'description': description,
        'privacy.view': 'unlisted' };
      this.httpPatch(url, this.accessToken, params).then(
        (data) => {
          this.logger.info(this, "createTicket", data);
          resolve(data);
        },
        (error) => {
          reject(error);
        })
    });
  }

  completeVideo(url:string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.httpDelete(url, this.accessToken).then(
        (data) => {
          this.logger.info(this, "completeVideo", data);
          resolve(data);
        },
        (error) => {
          reject(error);
        })
    });
  }

  getVideos(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = "https://api.vimeo.com/me/videos";
      this.httpGet(url, this.accessToken).then(
        (data) => {
          let videos = data['data'];
          this.logger.info(this, "getVideos", data);
          resolve(videos);
        },
        (error) => {
          reject(error);
        })
    });
  }

  getVideoUrl(name:string="Untitled"):Promise<string> {
    return new Promise((resolve, reject) => {
      let url = "https://api.vimeo.com/me/videos";
      this.httpGet(url, this.accessToken).then(
        (data) => {
          let videos = data['data'];
          this.logger.info(this, "getVideoUrl", url, data);
          for (let video of videos) {
            if (video.name === name) {
              resolve(video.link);
              return;
            }
          }
          reject('Video Not Found');
        },
        (error) => {
          reject(error);
        })
    });
  }

}
