import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Transfer} from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { NativeGeocoder, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';
import { NativeStorage } from '@ionic-native/native-storage';

import { Config } from '../models/config';
import { Login } from '../models/login';
import { Deployment } from '../models/deployment';
import { User } from '../models/user';
import { Form } from '../models/form';
import { Stage } from '../models/stage';
import { Attribute } from '../models/attribute';
import { Post } from '../models/post';
import { Value } from '../models/value';
import { Image } from '../models/image';
import { Collection } from '../models/collection';
import { Filter } from '../models/filter';
import { Tag } from '../models/tag';

import { HttpService } from '../providers/http-service';
import { LoggerService } from '../providers/logger-service';
import { DatabaseService } from '../providers/database-service';
import { VimeoService } from '../providers/vimeo-service';

import { USHAHIDI_CLIENT_ID, USHAHIDI_CLIENT_SECRET } from '../constants/secrets';

@Injectable()
export class ApiService extends HttpService {

  private source: string = "mobile";
  private clientId: string = USHAHIDI_CLIENT_ID;
  private clientSecret: string = USHAHIDI_CLIENT_SECRET;
  private scope: string = "api posts forms tags sets users media config";
  // api posts media forms tags savedsearches sets users stats layers
  // config messages notifications contacts roles permissions csv

  constructor(
    protected http: Http,
    protected file:File,
    protected transfer:Transfer,
    protected vimeo:VimeoService,
    protected logger:LoggerService,
    protected storage: NativeStorage,
    protected database:DatabaseService,
    protected nativeGeocoder:NativeGeocoder) {
    super(http, file, transfer, logger);
  }

  searchDeployments(search:string):Promise<Deployment[]> {
    return new Promise((resolve, reject) => {
      let params = {
        q: search
      };
      let url = "https://api.ushahidi.io/deployments";
      this.httpGet(url, null, params).then(
        (results:any[]) => {
          let deployments = [];
          for (let data of results) {
            if (data.status == 'deployed') {
              let deployment:Deployment = new Deployment(data);
              deployments.push(deployment);
            }
          }
          resolve(deployments);
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  registerDeployment(website:string):Promise<Deployment> {
    return new Promise((resolve, reject) => {
      let url = `${website}/config.json`;
      this.httpGet(url).then(
        (config:Config) => {
          if (config) {
            let deployment:Deployment = new Deployment(config);
            deployment.website = website;
            deployment.domain = website.replace("https://","").replace("http://","");
            if (config.backend_url && config.backend_url.length > 0) {
              deployment.api = config.backend_url;
              resolve(deployment);
            }
            else if (config.backend_domain && config.backend_domain.length > 0) {
              if (config.backend_domain.indexOf("https://") != -1) {
                deployment.api = config.backend_domain;
                resolve(deployment);
              }
              else if (config.backend_domain.indexOf("http://") != -1) {
                deployment.api = config.backend_domain;
                resolve(deployment);
              }
              else {
                let link = document.createElement('a');
                link.setAttribute('href', website);
                let domain = link.hostname.substring(link.hostname.indexOf(".") + 1);
                deployment.api = website.replace(domain, config.backend_domain);
                resolve(deployment);
              }
            }
            else {
              reject("Invalid Deployment Config");
            }
          }
          else {
            reject("Invalid Deployment Config");
          }
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  clientLogin(deployment:Deployment):Promise<Login> {
    return new Promise((resolve, reject) => {
      let url = deployment.api + "/oauth/token";
      let params = {
        grant_type: "client_credentials",
        scope: this.scope,
        client_id: deployment.client_id || this.clientId,
        client_secret: deployment.client_secret || this.clientSecret };
      this.httpPost(url, null, params).then(
        (data:any) => {
          let login:Login = <Login> {
            access_token: data.access_token };
          this.storage.setItem(deployment.website, JSON.stringify(login)).then(
              (data:any) => {
                resolve(login);
              },
              (error:any) => {
                reject(error);
              });
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  userLogin(deployment:Deployment, username:string, password:string):Promise<Login> {
    return new Promise((resolve, reject) => {
      let url = deployment.api + "/oauth/token";
      let params = {
        grant_type: "password",
        scope: this.scope,
        username: username,
        password: password,
        client_id: deployment.client_id || this.clientId,
        client_secret: deployment.client_secret || this.clientSecret };
      this.httpPost(url, null, params).then(
        (data:any) => {
          let login:Login = <Login> {
            username: username,
            password: password,
            access_token: data.access_token,
            refresh_token: data.refresh_token };
          this.storage.setItem(deployment.website, JSON.stringify(login)).then(
            (data:any) => {
              this.getUser(deployment, "me").then((user:User) => {
                login.user_id = user.id;
                login.user_role = user.role;
                this.storage.setItem(deployment.website, JSON.stringify(login)).then(
                  (data:any) => {
                    resolve(login);
                  },
                  (error:any) => {
                    reject(error);
                  });
              });
            },
            (error:any) => {
              reject(error);
            });
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  authRefresh(deployment:Deployment, refreshToken:string):Promise<Login> {
    return new Promise((resolve, reject) => {
      let url = deployment.api + "/oauth/token";
      let params = {
        grant_type: "refresh_token",
        scope: this.scope,
        refresh_token: refreshToken,
        client_id: deployment.client_id || this.clientId,
        client_secret: deployment.client_secret || this.clientSecret };
      this.httpPost(url, null, params).then(
        (data:any) => {
          let login:Login = <Login> {
            access_token: data.access_token,
            refresh_token: data.refresh_token };
          this.storage.setItem(deployment.website, JSON.stringify(login)).then(
            (data:any) => {
              resolve(login);
            },
            (error:any) => {
              reject(error);
            });
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  userOrClientLogin(deployment:Deployment, offline:boolean=false):Promise<Login> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "userOrClientLogin", deployment.website, "Offline", offline);
      this.getLogin(deployment).then(
        (login:Login) => {
            if (offline) {
              resolve(login);
            }
            else if (login.username && login.password) {
              this.userLogin(deployment, login.username, login.password).then(
                (_login:Login) => {
                  resolve(_login);
                },
                (error:any) => {
                  reject(error);
                });
            }
            else {
              this.clientLogin(deployment).then(
                (_login:Login) => {
                  resolve(_login);
                },
                (error:any) => {
                  reject(error);
                });
            }
         },
        (error:any) => {
          this.clientLogin(deployment).then(
            (_login:Login) => {
              resolve(_login);
            },
            (error:any) => {
              reject(error);
            });
        });
    });
  }

  getLogin(deployment:Deployment):Promise<Login> {
    return new Promise((resolve, reject) => {
      this.storage.getItem(deployment.website).then(
          (data:any) => {
            this.logger.info(this, "getLogin", deployment.website, data);
            if (data && data.length > 0) {
              let login:Login = <Login>JSON.parse(data);
              resolve(login);
            }
            else {
              reject("No Login");
            }
          },
          (error:any) => {
            this.logger.error(this, "getLogin", deployment.website, error);
            reject(error);
          });
    });
  }

  removeLogin(deployment:Deployment):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.remove(deployment.website).then(
        (removed:any) => {
          resolve(true);
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  apiGet(deployment:Deployment, endpoint:string, params:any=null):Promise<any> {
    return new Promise((resolve, reject) => {
      this.getLogin(deployment).then((login:Login) => {
        let url = deployment.api + endpoint;
        this.httpGet(url, login.access_token, params).then(
          (data:any) => {
            resolve(data);
          },
          (error:any) => {
            reject(error);
          });
      });
    });
  }

  apiPost(deployment:Deployment, endpoint:string, params:any=null):Promise<any> {
    return new Promise((resolve, reject) => {
      this.getLogin(deployment).then((login:Login) => {
        let url = deployment.api + endpoint;
        this.httpPost(url, login.access_token, params).then(
          (data:any) => {
            resolve(data);
          },
          (error:any) => {
            reject(error);
          });
      });
    });
  }

  apiPut(deployment:Deployment, endpoint:string, params:any=null):Promise<any> {
    return new Promise((resolve, reject) => {
      this.getLogin(deployment).then((login:Login) => {
        let url = deployment.api + endpoint;
        this.httpPut(url, login.access_token, params).then(
          (data:any) => {
            resolve(data);
          },
          (error:any) => {
            reject(error);
          });
      });
    });
  }

  apiDelete(deployment:Deployment, endpoint:string):Promise<any> {
    return new Promise((resolve, reject) => {
      this.getLogin(deployment).then((login:Login) => {
        let url = deployment.api + endpoint;
        this.httpDelete(url, login.access_token).then(
          (data:any) => {
            resolve(data);
          },
          (error:any) => {
            reject(error);
          });
      });
    });
  }

  apiUpload(deployment:Deployment, endpoint:string, file:string, caption:string, mimeType:string):Promise<any> {
    return new Promise((resolve, reject) => {
      this.getLogin(deployment).then((login:Login) => {
        let url = deployment.api + endpoint;
        this.fileUpload(url, login.access_token, file, caption, "POST", mimeType).then(
          (data:any) => {
            resolve(data);
          },
          (error:any) => {
            reject(error);
          });
      });
    });
  }

  getUsers(deployment:Deployment, cache:boolean=false, offline:boolean=false):Promise<User[]> {
    return new Promise((resolve, reject) => {
      if (cache || offline) {
        this.database.getUsers(deployment).then(
          (users:User[]) => {
            if (users && users.length > 0) {
              resolve(users);
            }
            else if (offline) {
              resolve([]);
            }
            else {
              this.getUsers(deployment, false).then(
                (users:User[]) => {
                  resolve(users);
                },
                (error:any) => {
                  reject(error);
                });
            }
          },
          (error:any) => {
            reject(error);
          });
      }
      else {
        this.apiGet(deployment, "/api/v3/users").then(
          (data:any) => {
            let saves = [];
            let users = [];
            deployment.users_count = data.total_count;
            saves.push(this.database.saveDeployment(deployment));
            for (let item of data.results) {
              let user:User = new User(item);
              users.push(user);
              saves.push(this.database.saveUser(deployment, user));
            }
            Promise.all(saves).then(
              (saved) => {
                resolve(users);
              },
              (error:any) => {
                reject(error);
              });
          },
          (error:any) => {
            reject(error);
          });
      }
    });
  }

  getUser(deployment:Deployment, user:any="me", cache:boolean=false, offline:boolean=false):Promise<User>  {
    return new Promise((resolve, reject) => {
      this.apiGet(deployment, `/api/v3/users/${user}`).then(
        (data:any) => {
          let user:User = new User(data);
          resolve(user);
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  getDeployment(deployment:Deployment, cache:boolean=false, offline:boolean=false):Promise<Deployment> {
    return new Promise((resolve, reject) => {
      if (cache || offline) {
        this.database.getDeployment(deployment.id).then(
          (deployment:Deployment) => {
            if (deployment.image && deployment.description) {
              resolve(deployment);
            }
            else if (offline) {
              resolve(deployment);
            }
            else {
              this.getDeployment(deployment, false, offline).then(
                (deployment:Deployment) => {
                  resolve(deployment);
                },
                (error:any) => {
                  reject(error);
                });
            }
          },
          (error:any) => {
            reject(error);
          });
      }
      else {
        this.apiGet(deployment, "/api/v3/config").then(
          (data:any) => {
            let config:any = {};
            for (let result of data.results) {
              if (result.id == 'map') {
                config.default_view = result.default_view;
              }
              else if (result.id == 'site') {
                config.name = result.name;
                config.email = result.email;
                config.timezone = result.timezone;
                config.language = result.language;
                config.image = result.image_header;
                config.description = result.description;
                config.allowed_privileges = result.allowed_privileges;
              }
            }
            let deployment:Deployment = new Deployment(config);
            resolve(deployment);
          },
          (error:any) => {
            reject(error);
          });
      }
    });
  }

  updateDeployment(deployment:Deployment, changes:{}=null):Promise<any> {
    return new Promise((resolve, reject) => {
      if (changes == null) {
        changes = {
          name: deployment.name,
          email: deployment.email,
          description: deployment.description };
      }
      this.apiPut(deployment, "/api/v3/config/site", changes).then(
        (data:any) => {
          resolve(data);
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  getPosts(deployment:Deployment, filter:Filter=null, cache:boolean=false, offline:boolean=false, limit:number=10, offset:number=0):Promise<Post[]> {
    return new Promise((resolve, reject) => {
      if (cache || offline) {
        this.database.getPosts(deployment, filter, limit, offset).then(
          (posts:Post[]) => {
            if (posts && posts.length >= limit) {
              resolve(posts);
            }
            else if (offline) {
              resolve([]);
            }
            else {
              this.getPosts(deployment, filter, false, offline, limit, offset).then(
                (posts:Post[]) => {
                  resolve(posts);
                },
                (error:any) => {
                  reject(error);
              });
            }
          },
          (error:any) => {
            reject(error);
          });
      }
      else {
        let params = { limit: limit, offset: offset };
        let statuses = [];
        if (filter == null || filter.show_published) {
          statuses.push("published");
        }
        if (filter == null || filter.show_archived) {
          statuses.push("archived");
        }
        if (filter == null || filter.show_inreview) {
          statuses.push("draft");
        }
        if (statuses.length > 0) {
          params['status'] = statuses.join(",");
        }
        if (filter && filter.show_forms && filter.show_forms.length > 0) {
          params["form"] = filter.show_forms;
        }
        if (filter && filter.search_text && filter.search_text.length > 0) {
          params["q"] = filter.search_text;
        }
        this.apiGet(deployment, "/api/v3/posts", params).then(
          (data:any) => {
            let saves = [];
            deployment.posts_count = data.total_count;
            saves.push(this.database.saveDeployment(deployment));
            for (let item of data.results) {
              let post:Post = new Post(item);
              post.deployment_id = deployment.id;
              post.url = `${deployment.website}/posts/${item.id}`;
              post.values = [];
              for (let key in item.values) {
                let value:Value = new Value();
                value.deployment_id = deployment.id;
                value.post_id = post.id;
                value.key = key;
                let values:any[] = item.values[key];
                if (values && values.length > 0) {
                  let text = values[0];
                  if (text && text.lat && text.lon) {
                    post.latitude = text.lat;
                    post.longitude = text.lon;
                    value.value = `${text.lat},${text.lon}`;
                  }
                  else {
                    value.value = values.join(',');
                  }
                }
                else {
                  value.value = "";
                }
                post.values.push(value);
                saves.push(this.database.saveValue(deployment, value));
              }
              saves.push(this.database.savePost(deployment, post));
            }
            Promise.all(saves).then(saved => {
              this.database.getPosts(deployment, filter, limit, offset).then(
                (posts:Post[]) => {
                  resolve(posts);
                },
                (error:any) => {
                  reject(error);
              });
            });
          },
          (error:any) => {
            reject(error);
          });
      }
    });
  }

  createPost(deployment:Deployment, post:Post):Promise<any> {
    return new Promise((resolve, reject) => {
      let params = {
        source: this.source,
        form: { id: post.form_id },
        title: post.title,
        content: post.description,
        values: post.packageValues() };
      if (post.user_id && post.user_id > 0) {
        params['user'] = { id: post.user_id };
      }
      this.apiPost(deployment, "/api/v3/posts", params).then(
        (data:any) => {
          resolve(data);
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  createPostWithMedia(deployment:Deployment, post:Post) {
    return new Promise((resolve, reject) => {
      let uploads = [];
      for (let value of post.values) {
        if (value.hasPendingImage()) {
          uploads.push(this.uploadImage(deployment, post, value));
        }
        else if (value.hasPendingVideo()) {
          uploads.push(this.uploadVideo(deployment, post, value));
        }
        else if (value.hasPendingAddress()) {
          uploads.push(this.geocodeAddress(deployment, post, value));
        }
      }
      Promise.all(uploads).then(
        (uploaded:any) => {
          this.createPost(deployment, post).then(
            (posted:any) => {
              resolve(posted);
            },
            (error:any) => {
              reject(error);
            });
        },
        (error:any) => {
          reject(error);
        });
      });
  }

  updatePost(deployment:Deployment, post:Post, changes:{}=null) {
    return new Promise((resolve, reject) => {
      if (changes == null) {
        changes = {
          title: post.title,
          content: post.description,
          values: post.packageValues() };
      }
      this.apiPut(deployment, `/api/v3/posts/${post.id}`, changes).then(
        (data:any) => {
          resolve(data);
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  updatePostWithMedia(deployment:Deployment, post:Post) {
    return new Promise((resolve, reject) => {
      let uploads = [];
      for (let value of post.values) {
        if (value.hasPendingImage()) {
          uploads.push(this.uploadImage(deployment, post, value));
        }
        else if (value.hasPendingVideo()) {
          uploads.push(this.uploadVideo(deployment, post, value));
        }
        else if (value.hasPendingAddress()) {
          uploads.push(this.geocodeAddress(deployment, post, value));
        }
      }
      Promise.all(uploads).then(
        (uploaded:any) => {
          this.updatePost(deployment, post).then(
            (posted:any) => {
              resolve(posted);
            },
            (error:any) => {
              reject(error);
            });
        },
        (error:any) => {
          reject(error);
        });
      });
  }

  deletePost(deployment:Deployment, post:Post):Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiDelete(deployment, `/api/v3/posts/${post.id}`).then(
        (data:any) => {
          resolve(data);
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  uploadVideo(deployment:Deployment, post:Post, value:Value):Promise<string> {
    return new Promise((resolve, reject) => {
      let file:string = value.value;
      this.logger.info(this, "uploadVideo", file);
      this.vimeo.uploadVideo(file, post.title, post.description).then(
        (url:string) => {
          this.logger.info(this, "uploadVideo", file, url);
          value.value = url;
          this.database.saveValue(deployment, value).then(
            (saved:any) => {
              resolve(url);
            },
            (error:any) => {
              reject(error);
            });
        },
        (error:any) => {
          this.logger.error(this, "uploadVideo", file, error);
          reject(error);
        });
    });
  }

  getImages(deployment:Deployment, cache:boolean=false, offline:boolean=false, limit:number=10, offset:number=0):Promise<Image[]> {
    return new Promise((resolve, reject) => {
      if (cache || offline) {
        this.database.getImages(deployment, limit, offset).then(
          (images:Image[]) => {
            if (images && images.length >= limit) {
              resolve(images);
            }
            else if (offline) {
              resolve([]);
            }
            else {
              this.getImages(deployment, false, offline, limit, offset).then(
                (images:Image[]) => {
                  resolve(images);
                },
                (error:any) => {
                  reject(error);
                });
            }
          },
          (error:any) => {
            this.getImages(deployment, false, offline, limit, offset).then(
              (images:Image[]) => {
                resolve(images);
              },
              (error:any) => {
                reject(error);
              });
          });
      }
      else {
        let params = {
          order: "desc",
          limit: limit,
          offset: offset };
        this.apiGet(deployment, "/api/v3/media", params).then(
          (data:any) => {
            let saves = [];
            let images = [];
            deployment.images_count = data.total_count;
            saves.push(this.database.saveDeployment(deployment));
            for (let item of data.results) {
              let image:Image = new Image(item);
              image.deployment_id = deployment.id;
              images.push(image);
              saves.push(this.database.saveImage(deployment, image));
            }
            Promise.all(saves).then(
              (saved:any) => {
                resolve(images);
              },
              (error:any) => {
                reject(error);
              });
          },
          (error:any) => {
            reject(error);
          });
      }
    });
  }

  getImage(deployment:Deployment, id:number, cache:boolean=false, offline:boolean=false):Promise<Image> {
    return new Promise((resolve, reject) => {
      if (cache || offline) {
        this.database.getImage(deployment, id).then(
          (image:Image) => {
            if (image) {
              resolve(image);
            }
            else if (offline) {
              reject("No Internet");
            }
            else {
              this.getImage(deployment, id, false, offline).then(
                (image:Image) => {
                  resolve(image);
                },
                (error:any) => {
                  reject(error);
                });
            }
          },
          (error:any) => {
            this.getImage(deployment, id, false, offline).then(
              (image:Image) => {
                resolve(image);
              },
              (error:any) => {
                reject(error);
              });
          });
      }
      else {
        this.apiGet(deployment, `/api/v3/media/${id}`).then(
          (data:any) => {
            let image:Image = new Image(data);
            image.deployment_id = deployment.id;
            this.database.saveImage(deployment, image).then((saved) => {
              resolve(image);
            })
          },
          (error:any) => {
            reject(error);
          });
      }
    });
  }

  uploadImage(deployment:Deployment, post:Post, value:Value):Promise<Image> {
    return new Promise((resolve, reject) => {
      let file = value.value;
      let mimeType = this.mimeType(file);
      let caption = value.caption;
      this.logger.info(this, "uploadImage", file);
      this.apiUpload(deployment, "/api/v3/media", file, caption, mimeType).then(
        (data:any) => {
          this.logger.info(this, "uploadImage", file, data);
          let item = JSON.parse(data.response);
          let image:Image = new Image(item);
          image.deployment_id = deployment.id;
          value.value = "" + image.id;
          let saves = [
            this.database.saveImage(deployment, image),
            this.database.saveValue(deployment, value)
          ];
          Promise.all(saves).then(
            (saved:any) => {
              resolve(image);
            },
            (error:any) => {
              reject(error);
            });
        },
        (error:any) => {
          reject(error);
        });
    });
  }

  getForms(deployment:Deployment, cache:boolean=false, offline:boolean=false):Promise<Form[]> {
    return new Promise((resolve, reject) => {
      if (cache || offline) {
        this.database.getForms(deployment).then(
          (forms:Form[]) => {
            if (forms && forms.length > 0) {
              resolve(forms);
            }
            else if (offline) {
              resolve([]);
            }
            else {
              this.getForms(deployment, false, offline).then(
                (forms:Form[]) => {
                  resolve(forms);
                },
                (error:any) => {
                  reject(error);
                });
            }
          },
          (error:any) => {
            reject(error);
          });
      }
      else {
        this.apiGet(deployment, "/api/v3/forms").then(
          (data:any) => {
            let forms = [];
            let saves = [];
            deployment.forms_count = data.total_count;
            saves.push(this.database.saveDeployment(deployment));
            for (let item of data.results) {
              let form:Form = new Form(item);
              form.deployment_id = deployment.id;
              forms.push(form);
              saves.push(this.database.saveForm(deployment, form));
            }
            Promise.all(saves).then(
              (saved:any) => {
                resolve(forms);
              },
              (error:any) => {
                reject(error);
              });
          },
          (error:any) => {
            reject(error);
          });
      }
    });
  }

  getStages(deployment:Deployment, cache:boolean=false, offline:boolean=false):Promise<Stage[]> {
    return new Promise((resolve, reject) => {
      if (cache || offline) {
        this.database.getStages(deployment).then(
          (stages:Stage[]) => {
            if (stages && stages.length > 0) {
              resolve(stages);
            }
            else if (offline) {
              resolve([]);
            }
            else {
              this.getStages(deployment, false, offline).then(
                (stages:Stage[]) => {
                  resolve(stages);
                },
                (error:any) => {
                  reject(error);
                }
              );
            }
          },
          (error:any) => {
            reject(error);
          });
      }
      else {
        this.apiGet(deployment, "/api/v3/forms/stages").then(
          (data:any) => {
            let saves = [];
            let stages = [];
            for (let item of data.results) {
              let stage:Stage = new Stage(item);
              stage.deployment_id = deployment.id;
              stages.push(stage);
              saves.push(this.database.saveStage(deployment, stage));
            }
            Promise.all(saves).then(
              (saved:any) => {
                resolve(stages);
              },
              (error:any) => {
                reject(error);
              });
          },
          (error:any) => {
            reject(error);
          });
      }
    });
  }

  getAttributes(deployment:Deployment, cache:boolean=false, offline:boolean=false):Promise<Attribute[]> {
    return new Promise((resolve, reject) => {
      if (cache || offline) {
        this.database.getAttributes(deployment).then(
          (attributes:Attribute[]) => {
            if (attributes && attributes.length > 0) {
              resolve(attributes);
            }
            else if (offline) {
              resolve([]);
            }
            else {
              this.getAttributes(deployment, false, offline).then(
                (attributes:Attribute[]) => {
                  resolve(attributes);
                },
                (error:any) => {
                  reject(error);
                }
              );
            }
          },
          (error:any) => {
            reject(error);
          });
      }
      else {
        this.apiGet(deployment, "/api/v3/forms/attributes").then(
          (data:any) => {
            let saves = [];
            let attributes = [];
            for (let item of data.results) {
              this.logger.info(this, "getAttributes", item);
              let attribute:Attribute = new Attribute(item);
              attribute.deployment_id = deployment.id;
              attributes.push(attribute);
              saves.push(this.database.saveAttribute(deployment, attribute));
            }
            Promise.all(saves).then(
              (saved:any) => {
                resolve(attributes);
              },
              (error:any) => {
                reject(error);
              });
          },
          (error:any) => {
            reject(error);
          });
      }
    });
  }

  getCollections(deployment:Deployment, cache:boolean=false, offline:boolean=false):Promise<Collection[]> {
    return new Promise((resolve, reject) => {
      if (cache || offline) {
        this.database.getCollections(deployment).then(
          (collections:Collection[]) => {
            if (collections && collections.length > 0) {
              resolve(collections);
            }
            else if (offline) {
              resolve([]);
            }
            else {
              this.getCollections(deployment, false, offline).then(
                (collections:Collection[]) => {
                  resolve(collections);
                },
                (error:any) => {
                  reject(error);
                });
            }
          },
          (error:any) => {
            reject(error);
          });
      }
      else {
        this.apiGet(deployment, "/api/v3/collections").then(
          (data:any) => {
            let saves = [];
            let collections = [];
            deployment.collections_count = data.total_count;
            saves.push(this.database.saveDeployment(deployment));
            for (let item of data.results) {
              let collection:Collection = new Collection(item);
              collection.deployment_id = deployment.id;
              collections.push(collection);
              saves.push(this.database.saveCollection(deployment, collection));
            }
            Promise.all(saves).then(
              (saved:any) => {
                resolve(collections);
              },
              (error:any) => {
                reject(error);
              });
          },
          (error:any) => {
            reject(error);
          });
      }
    });
  }

  getTags(deployment:Deployment, cache:boolean=false, offline:boolean=false):Promise<Tag[]> {
    return new Promise((resolve, reject) => {
      if (cache || offline) {
        this.database.getTags(deployment).then(
          (tags:Tag[]) => {
            if (tags && tags.length > 0) {
              resolve(tags);
            }
            else if (offline) {
              resolve([]);
            }
            else {
              this.getTags(deployment, false, offline).then(
                (tags:Tag[]) => {
                  resolve(tags);
                },
                (error:any) => {
                  reject(error);
                });
            }
          },
          (error:any) => {
            reject(error);
          });
      }
      else {
        this.apiGet(deployment, "/api/v3/tags").then(
          (data:any) => {
            let saves = [];
            let tags = [];
            deployment.collections_count = data.total_count;
            saves.push(this.database.saveDeployment(deployment));
            for (let item of data.results) {
              let tag:Tag = new Tag(item);
              tag.deployment_id = deployment.id;
              tags.push(tag);
              saves.push(this.database.saveTag(deployment, tag));
            }
            Promise.all(saves).then(
              (saved:any) => {
                resolve(tags);
              },
              (error:any) => {
                reject(error);
              });
          },
          (error:any) => {
            reject(error);
          });
      }
    });
  }

  addPostToCollection(deployment:Deployment, post:Post, collection:Collection) {
    return new Promise((resolve, reject) => {
      let params = {
        id: post.id };
      this.apiPost(deployment, `/api/v3/collections/${collection.id}/posts`, params).then(
        (data:any) => {
          resolve(data);
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  removePostToCollection(deployment:Deployment, post:Post, collection:Collection) {
    return new Promise((resolve, reject) => {
      this.apiDelete(deployment, `/api/v3/collections/${collection.id}/posts/${post.id}`).then(
        (data:any) => {
          resolve(data);
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  getFormsWithAttributes(deployment:Deployment, cache:boolean=false, offline:boolean=false):Promise<Form[]> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "getFormsWithAttributes", cache);
      Promise.all([
        this.getForms(deployment, cache, offline),
        this.getStages(deployment, cache, offline),
        this.getAttributes(deployment, cache, offline),
        this.getTags(deployment, cache, offline)]).then(
          (results:any[]) => {
            let saves = [];
            let forms = <Form[]>results[0];
            let stages = <Stage[]>results[1];
            let attributes = <Attribute[]>results[2];
            let tags = <Tag[]>results[3];
            this.logger.info(this, "getFormsWithAttributes", "Forms", forms.length, "Stages", stages.length, "Attributes", attributes.length, "Tags", tags.length);
            for (let stage of stages) {
              for (let attribute of attributes) {
                if (attribute.form_stage_id == stage.id) {
                  if (attribute.form_id == null) {
                    attribute.form_id = stage.form_id;
                    saves.push(this.database.saveAttribute(deployment, attribute));
                  }
                }
              }
            }
            for (let form of forms) {
              form.loadStages(stages);
              for (let stage of stages) {
                stage.loadAttributes(attributes);
              }
              form.loadAttributes(attributes);
              this.logger.info(this, "getFormsWithAttributes", "Form", form.name, "Stages", form.stages.length, "Attributes", form.attributes.length);
            }
            for (let attribute of attributes) {
              attribute.loadTags(tags);
            }
            return Promise.all(saves).then((saved) => {
              this.logger.info(this, "getFormsWithAttributes", "Saves", saves.length, "Saved");
              resolve(forms);
            });
          },
          (error:any) => {
            this.logger.error(this, "getFormsWithAttributes", error);
            reject(error);
          });
    });
  }

  getPostsWithValues(deployment:Deployment, filter:Filter=null, cache:boolean=false, offline:boolean=false, limit:number=10, offset:number=0):Promise<Post[]> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "getPostsWithValues", "Filter", filter, "Cache", cache, "Offline", offline, "Limit", limit, "Offset", offset);
      Promise.all([
        this.getPosts(deployment, filter, cache, offline, limit, offset),
        this.getImages(deployment, true, offline, limit, offset),
        this.getForms(deployment, true, offline),
        this.getUsers(deployment, true, offline),
        this.getAttributes(deployment, true, offline)]).then(
          (results:any[]) => {
            this.logger.info(this, "getPostsWithValues", "Filter", filter, "Cache", cache, "Offline", offline, "Limit", limit, "Offset", offset);
            let posts = <Post[]>results[0];
            let images = <Image[]>results[1];
            let forms = <Form[]>results[2];
            let users = <User[]>results[3];
            let attributes = <Attribute[]>results[4];
            let saves = [];
            for (let post of posts) {
              post.loadUser(users);
              post.loadForm(forms);
              for (let value of post.values) {
                value.loadAttribute(attributes);
                if (value.isImage()) {
                  value.loadImage(images);
                  post.loadImage(images, value.value);
                }
                saves.push(this.database.saveValue(deployment, value));
              }
              saves.push(this.database.savePost(deployment, post));
            }
            return Promise.all(saves).then((saved) => {
              this.logger.info(this, "getPostsWithValues", "Filter", filter, "Cache", cache, "Offline", offline, "Limit", limit, "Offset", offset, "Posts", posts.length);
              resolve(posts);
            });
          },
          (error:any) => {
            this.logger.error(this, "getPostsWithValues", "Failed", error);
            reject(error);
          });
    });
  }

  geocodeAddress(deployment:Deployment, post:Post, value:Value):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let address:string = value.value;
      this.logger.info(this, "geocodeAddress", address);
      this.nativeGeocoder.forwardGeocode(address)
        .then((coordinates:NativeGeocoderForwardResult) => {
          this.logger.info(this, "geocodeAddress", address, coordinates);
          post.latitude = Number(coordinates.latitude);
          post.longitude = Number(coordinates.longitude);
          value.value = `${coordinates.latitude},${coordinates.longitude}`;
          let saves = [];
          if (post.isPersisted()) {
            saves.push(this.database.savePost(deployment, post));
          }
          saves.push(this.database.saveValue(deployment, value));
          Promise.all(saves).then(
            (saved:any) => {
              resolve(true);
            },
            (error:any) => {
              reject(error);
            });
        })
        .catch((error:any) => {
          this.logger.error(this, "geocodeAddress", address, error);
          reject(error);
        });
    });
  }

}
