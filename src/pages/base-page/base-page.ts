import { Component, ViewChild, NgZone } from '@angular/core';
import { Content, Platform, Events, NavParams, Alert, AlertController, Toast, ToastController, Modal, ModalController, Loading, LoadingController, ActionSheet, ActionSheetController, NavController, ViewController } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { Network } from '@ionic-native/network';
import { SocialSharing } from '@ionic-native/social-sharing';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { ThemeableBrowser, ThemeableBrowserOptions, ThemeableBrowserObject } from '@ionic-native/themeable-browser';

import { LoggerService } from '../../providers/logger-service';
import { InjectorService } from '../../providers/injector-service';
import { LanguageService, LanguageChanged } from '../../providers/language-service';
import { SettingsService } from '../../providers/settings-service';

@Component({
  selector: 'base-page',
  templateUrl: 'base-page.html',
  providers: [ LoggerService ],
})
export class BasePage {

  protected offline: boolean = false;
  protected connection: any = null;
  protected disconnection: any = null;
  protected colorNavbar: string = "#3f4751";
  protected direction:string = "lrt";
  protected languageChanged: any = null;

  protected zone:NgZone;
  protected events:Events;
  protected network:Network;
  protected statusBar:StatusBar;
  protected themeableBrowser:ThemeableBrowser;
  protected socialSharing:SocialSharing;
  protected googleAnalytics:GoogleAnalytics;
  protected language:LanguageService;
  protected settings:SettingsService;

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
    this.googleAnalytics = InjectorService.injector.get(GoogleAnalytics);
    this.language = InjectorService.injector.get(LanguageService);
    this.settings = InjectorService.injector.get(SettingsService);
  }

  ionViewDidLoad() {
    this.logger.info(this, "ionViewDidLoad");
    this.loadLanguage();
    this.loadSettings();
  }

  ionViewWillEnter() {
    this.logger.info(this, "ionViewWillEnter", "Network", this.network.type);
    this.subscribeNetwork();
  }

  ionViewDidEnter() {
    this.logger.info(this, "ionViewDidEnter");
    let screen = this.constructor.name.replace("Page", "").replace(/([A-Z])/g," $1").trim();
    this.trackView(screen);
  }

  ionViewWillLeave() {
    this.logger.info(this, "ionViewWillLeave");
    this.unloadLanguage();
    this.unsubscribeNetwork();
  }

  ionViewDidLeave() {
    this.logger.info(this, "ionViewDidLeave");
  }

  ionViewWillUnload() {
    this.logger.info(this, "ionViewWillUnload");
  }

  loadLanguage() {
    this.logger.info(this, "loadLanguage");
    this.direction = this.language.getDirection();
    this.languageChanged = this.events.subscribe(LanguageChanged, (i18n:string) => {
      this.logger.info(this, "loadLanguage", LanguageChanged, i18n);
      this.direction = this.language.getDirection();
    });
  }

  unloadLanguage() {
    if (this.languageChanged) {
      this.languageChanged.unsubscribe();
      this.languageChanged = null;
    }
  }

  loadSettings() {
    this.logger.info(this, "loadSettings");
    this.settings.getColorNavbar().then((colorNavbar:string) => {
      this.colorNavbar = colorNavbar;
    },
    (error:any) => {
      this.colorNavbar = "#3f4751";
    });
  }

  subscribeNetwork() {
    this.logger.info(this, "subscribeNetwork", "Network", this.network.type);
    if (this.network.type == 'none') {
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
      this.logger.info(this, "subscribeNetwork", "Network Connected", this.network.type);
      this.zone.run(() => {
        this.offline = false;
        this.resizeContent();
      });
    });
    this.disconnection = this.network.onDisconnect().subscribe(() => {
      this.logger.info(this, "subscribeNetwork", "Network Disconnected", this.network.type);
      this.zone.run(() => {
        this.offline = true;
        this.resizeContent();
      });
    });
  }

  unsubscribeNetwork() {
    this.logger.info(this, "unsubscribeNetwork", "Network", this.network.type);
    if (this.connection) {
      this.connection.unsubscribe();
      this.connection = null;
    }
    if (this.disconnection) {
      this.disconnection.unsubscribe();
      this.disconnection = null;
    }
  }

  loadStatusBar(lightContent:boolean=true, overlaysWebView:boolean=false) {
    this.platform.ready().then(() => {
      if (lightContent) {
        this.statusBar.styleLightContent();
      }
      else {
        this.statusBar.styleDefault();
      }
      this.statusBar.overlaysWebView(overlaysWebView);
      this.statusBar.backgroundColorByHexString(this.colorNavbar);
    });
  }

  getParameter<T extends Object>(param:string):T {
    return <T>this.navParams.get(param);
  }

  showLoading(message:string):Loading {
    let loading = this.loadingController.create({
      content: message
    });
    loading.present();
    return loading;
  }

  showToast(message:string, duration:number=3000):Toast {
    let toast = this.toastController.create({
      message: message,
      duration: duration
    });
    toast.present();
    return toast;
  }

  showAlert(title:string, subTitle:string, buttons:any=['OK']):Alert {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: buttons
    });
    alert.present();
    return alert;
  }

  showConfirm(title:string, subTitle:string, buttons:any=['OK']):Alert {
    let alert = this.alertController.create({
      title: title,
      subTitle: subTitle,
      buttons: buttons
    });
    alert.present();
    return alert;
  }

  showActionSheet(title:string, buttons:any):ActionSheet {
    let actionSheet = this.actionController.create({
      title: title,
      buttons: buttons
    });
    actionSheet.present();
    return actionSheet;
  }

  showModal(page:any, params:any={}, options:any={}):Modal {
    let modal = this.modalController.create(page, params, options);
    modal.present();
    return modal;
  }

  hideModal(data:any=null, options:any={}) {
    return this.viewController.dismiss(data, options);
  }

  showPage(page:any, params:any={}, options:any={}) {
    return this.navController.push(page, params, options);
  }

  showRootPage(page:any, params:any={}, options:any={}) {
    return this.navController.setRoot(page, params, options);
  }

  closePage(data:any=null, options:any={}) {
    return this.viewController.dismiss(data, options);
  }

  showShare(subject:string, message:string=null, file:string=null, url:string=null) {
    return this.socialSharing.share(message, subject, file, url);
  }

  showUrl(url:string, target:string="_blank", event:any=null):ThemeableBrowserObject {
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

  showOfflineAlert() {
    this.language.getTranslations([
      'OFFLINE_WARNING',
      'OFFLINE_WARNING_DESCRIPTION']).then((translations:string[]) => {
      this.showAlert(translations[0], translations[1]);
    });
  }

  resizeContent(delay:number=100) {
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

  runSequentially(tasks):Promise<any> {
    var result = Promise.resolve();
    tasks.forEach(task => {
      result = result.then(() => task());
    });
    return result;
  }

  trackView(screen:string, campaign:string=null, session:boolean=false) {
    this.googleAnalytics.trackView(screen, campaign, session).then((tracked) => {
      this.logger.info(this, "trackView", screen);
    });
  }

  trackEvent(category:string, action:string, label:string, value:number=0, newSession:boolean=false) {
    this.googleAnalytics.trackEvent(category, action, label, value, newSession).then((tracked) => {
      this.logger.info(this, "trackEvent", category, action, label);
    });
  }

  handleLinks(_event:any) {
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

}
