import { Component, ViewChild, NgZone } from '@angular/core';
import { Content, Platform, Events, NavParams, Alert, AlertController, Toast, ToastController, Modal, ModalController, Loading, LoadingController, ActionSheet, ActionSheetController, NavController, ViewController } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { Network } from '@ionic-native/network';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Keyboard } from '@ionic-native/keyboard';
import { ThemeableBrowser, ThemeableBrowserOptions, ThemeableBrowserObject } from '@ionic-native/themeable-browser';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { LoggerService } from '../../providers/logger-service';
import { InjectorService } from '../../providers/injector-service';
import { LanguageService, LanguageChanged } from '../../providers/language-service';
import { SettingsService } from '../../providers/settings-service';

@Component({
  selector: 'base-page',
  templateUrl: 'base-page.html',
  providers: [ LoggerService, SettingsService, LanguageService ],
})
export class BasePage {

  protected offline:boolean = false;
  protected connection:any = null;
  protected disconnection:any = null;
  protected colorNavbar:string = "#3f4751";
  protected direction:string = "lrt";
  protected languageChanged: any = null;
  protected tablet:boolean = false;
  protected android:boolean = false;
  protected landscape:boolean = false;

  protected zone:NgZone;
  protected events:Events;
  protected network:Network;
  protected statusBar:StatusBar;
  protected themeableBrowser:ThemeableBrowser;
  protected socialSharing:SocialSharing;
  protected language:LanguageService;
  protected settings:SettingsService;
  protected screenOrientation:ScreenOrientation;
  protected keyboard:Keyboard;

  @ViewChild(Content)
  content: Content;

  constructor(
    protected _zone:NgZone,
    protected platform:Platform,
    protected navParams:NavParams,
    protected navController:NavController,
    protected viewController:ViewController,
    protected modalController:ModalController,
    protected toastController:ToastController,
    protected alertController:AlertController,
    protected loadingController:LoadingController,
    protected actionController:ActionSheetController,
    protected logger:LoggerService) {
    this.zone = _zone;
    this.events = InjectorService.injector.get(Events);
    this.network = InjectorService.injector.get(Network);
    this.statusBar = InjectorService.injector.get(StatusBar);
    this.themeableBrowser = InjectorService.injector.get(ThemeableBrowser);
    this.socialSharing = InjectorService.injector.get(SocialSharing);
    this.language = InjectorService.injector.get(LanguageService);
    this.settings = InjectorService.injector.get(SettingsService);
    this.screenOrientation = InjectorService.injector.get(ScreenOrientation);
    this.keyboard = InjectorService.injector.get(Keyboard);
  }

  ionViewDidLoad() {
    this.logger.info(this, "ionViewDidLoad");
    this.loadLanguage();
    this.loadSettings();
    this.loadOrientation();
  }

  ionViewWillEnter() {
    let network = this.networkType();
    this.logger.info(this, "ionViewWillEnter", "Network", network);
    this.networkSubscribe();
  }

  ionViewDidEnter() {
    let screen = this.screenName();
    this.logger.info(this, "ionViewDidEnter", "Screen", screen);
    this.logger.view(this, screen);
  }

  ionViewWillLeave() {
    this.logger.info(this, "ionViewWillLeave");
    this.unloadLanguage();
    this.networkUnsubscribe();
  }

  ionViewDidLeave() {
    this.logger.info(this, "ionViewDidLeave");
  }

  ionViewWillUnload() {
    this.logger.info(this, "ionViewWillUnload");
  }

  protected loadLanguage() {
    this.logger.info(this, "loadLanguage");
    this.direction = this.language.getDirection();
    this.languageChanged = this.events.subscribe(LanguageChanged, (i18n:string) => {
      this.logger.info(this, "loadLanguage", LanguageChanged, i18n);
      this.direction = this.language.getDirection();
    });
  }

  protected unloadLanguage() {
    this.logger.info(this, "unloadLanguage");
    if (this.languageChanged) {
      this.languageChanged.unsubscribe();
      this.languageChanged = null;
    }
  }

  protected loadSettings() {
    this.logger.info(this, "loadSettings");
    if (this.platform.is('android')) {
      this.logger.info(this, "loadSettings", "Android");
      this.android = true;
    }
    else {
      this.logger.info(this, "loadSettings", "Apple");
      this.android = false;
    }
    if (this.platform.is('tablet')) {
      this.logger.info(this, "loadSettings", "Tablet");
      this.tablet = true;
    }
    else {
      this.logger.info(this, "loadSettings", "Phone");
      this.tablet = false;
    }
    this.settings.getColorNavbar().then((colorNavbar:string) => {
      this.colorNavbar = colorNavbar;
    },
    (error:any) => {
      this.colorNavbar = "#3f4751";
    });
  }

  protected loadOrientation() {
    this.logger.info(this, "loadOrientation", this.screenOrientation.type);
    if (this.platform.isLandscape()) {
      this.logger.info(this, "loadSettings", "Landscape");
      this.landscape = true;
    }
    else {
      this.logger.info(this, "loadSettings", "Portrait");
      this.landscape = false;
    }
    this.screenOrientation.onChange().subscribe(() => {
      this.logger.info(this, "Orientation", this.screenOrientation.type);
      let orientation = this.screenOrientation.type.replace('-primary','').replace('-secondary','');
      if (orientation == 'landscape') {
        this.logger.info(this, "Orientation", "Landscape");
        this.landscape = true;
      }
      else {
        this.logger.info(this, "Orientation", "Portrait");
        this.landscape = false;
      }
   });
  }

  protected networkSubscribe() {
    this.logger.info(this, "networkSubscribe", "Network", this.network.type);
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.zone.run(() => {
        this.offline = true;
        this.resizeContent();
      });
    }
    else {
      this.zone.run(() => {
        this.offline = false;
      });
    }
    this.connection = this.network.onConnect().subscribe(() => {
      this.logger.info(this, "networkSubscribe", "Connected", this.network.type);
      this.zone.run(() => {
        this.offline = false;
        this.resizeContent();
      });
    });
    this.disconnection = this.network.onDisconnect().subscribe(() => {
      this.logger.info(this, "networkSubscribe", "Disconnected", this.network.type);
      this.zone.run(() => {
        this.offline = true;
        this.resizeContent();
      });
    });
  }

  protected networkUnsubscribe() {
    this.logger.info(this, "networkUnsubscribe", "Network", this.network.type);
    if (this.connection) {
      this.connection.unsubscribe();
      this.connection = null;
    }
    if (this.disconnection) {
      this.disconnection.unsubscribe();
      this.disconnection = null;
    }
  }

  protected networkOffline():boolean {
    return this.network.type == 'none' || this.network.type == 'unknown';
  }

  protected loadStatusBar(lightContent:boolean=true, overlaysWebView:boolean=true) {
    this.platform.ready().then(() => {
      if (lightContent) {
        this.statusBar.styleLightContent();
      }
      else {
        this.statusBar.styleDefault();
      }
      if (this.platform.is("android")) {
        this.statusBar.overlaysWebView(false);
      }
      else if (overlaysWebView) {
        this.statusBar.overlaysWebView(true);
      }
      else {
        this.statusBar.overlaysWebView(false);
      }
      this.statusBar.backgroundColorByHexString(this.colorNavbar);
    });
  }

  protected showKeyboard(event:any=null) {
    this.keyboard.show();
  }

  protected hideKeyboard(event:any=null) {
    this.keyboard.close();
  }

  protected getParameter<T extends Object>(param:string):T {
    return <T>this.navParams.get(param);
  }

  protected showLoading(message:string):Loading {
    let loading = this.loadingController.create({
      content: message
    });
    loading.present();
    return loading;
  }

  protected showToast(message:string, duration:number=3000):Toast {
    let toast = this.toastController.create({
      message: message,
      duration: duration
    });
    toast.present();
    return toast;
  }

  protected showAlert(title:string, subTitle:string, buttons:any=['OK']):Alert {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: buttons
    });
    alert.present();
    return alert;
  }

  protected showConfirm(title:string, subTitle:string, buttons:any=['OK']):Alert {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: buttons
    });
    alert.present();
    return alert;
  }

  protected showActionSheet(title:string, buttons:any):ActionSheet {
    let actionSheet = this.actionController.create({
      title: title,
      buttons: buttons
    });
    actionSheet.present();
    return actionSheet;
  }

  protected showModal(page:any, params:any={}, options:any={}):Modal {
    let modal = this.modalController.create(page, params, options);
    modal.present();
    return modal;
  }

  protected hideModal(data:any=null, options:any={}) {
    return this.viewController.dismiss(data, options);
  }

  protected showPage(page:any, params:any={}, options:any={}) {
    return this.navController.push(page, params, options);
  }

  protected showRootPage(page:any, params:any={}, options:any={}) {
    return this.navController.setRoot(page, params, options);
  }

  protected closePage(data:any=null, options:any={}) {
    return this.viewController.dismiss(data, options);
  }

  protected showShare(subject:string, message:string=null, file:string=null, url:string=null) {
    return this.socialSharing.share(message, subject, file, url);
  }

  protected showUrl(url:string, target:string="_blank", event:any=null):ThemeableBrowserObject {
    this.logger.info(this, "showUrl", url, target);
    let options:ThemeableBrowserOptions = {
      statusbar: {
        color: this.colorNavbar
      },
        toolbar: {
        height: 44,
        color: this.colorNavbar
      },
        title: {
        color: '#ffffff',
        showPageTitle: true
      },
      backButton: {
        wwwImage: 'assets/images/back.png',
        wwwImageDensity: 2,
        align: 'right',
        event: 'backPressed'
      },
      forwardButton: {
        wwwImage: 'assets/images/forward.png',
        wwwImageDensity: 2,
        align: 'right',
        event: 'forwardPressed'
      },
      closeButton: {
        wwwImage: 'assets/images/close.png',
        wwwImageDensity: 2,
        align: 'left',
        event: 'closePressed'
      },
      backButtonCanClose: true
    };
    let browser = this.themeableBrowser.create(url, target, options);
    if (this.platform.is("ios")) {
      browser.show();
    }
    if (event) {
      event.stopPropagation();
    }
    return browser;
  }

  protected showOfflineAlert() {
    this.language.getTranslations([
      'OFFLINE_WARNING',
      'OFFLINE_WARNING_DESCRIPTION']).then((translations:string[]) => {
      this.showAlert(translations[0], translations[1]);
    });
  }

  protected resizeContent(delay:number=100) {
    setTimeout(() => {
      if (this.content) {
        this.logger.info(this, "resizeContent");
        this.content.resize();
      }
      else {
        this.logger.error(this, "resizeContent", "NULL");
      }
    }, delay);
  }

  protected handleLinks(_event:any) {
    let event = _event || window.event;
    let element = event.target || event.srcElement;
    if (element && element.tagName == 'A') {
      event.stopPropagation();
      if (element.target == '_blank') {
        this.showUrl(element.href, element.target);
      }
      else {
        window.open(element.href, "_system");
      }
      return false;
    }
  }

  protected runSequentially(tasks):Promise<any> {
    var result = Promise.resolve();
    tasks.forEach(task => {
      result = result.then(() => task());
    });
    return result;
  }

  protected screenName():string {
    if (this.constructor) {
        return this.constructor.name.replace("Page", "").replace(/([A-Z])/g," $1").trim();
    }
    return "";
  }

  protected networkType():string {
    if (this.network && this.network.type) {
      return this.network.type;
    }
    return "";
  }

  protected isKeyReturn(event:any):boolean {
    if (event && event.keyCode && event.keyCode == 13) {
      return true;
    }
    return false;
  }

}
