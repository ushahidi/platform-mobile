import { NgModule, Injectable, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { HttpModule, Http } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService, TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MarkdownToHtmlModule } from 'markdown-to-html-pipe';

import { AppVersion } from '@ionic-native/app-version';
import { IsDebug } from '@ionic-native/is-debug';
import { StatusBar } from '@ionic-native/status-bar';
import { FileTransfer } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { Device } from '@ionic-native/device';
import { Camera } from '@ionic-native/camera';
import { MediaCapture } from '@ionic-native/media-capture';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Network } from '@ionic-native/network';
import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';
import { Keyboard } from '@ionic-native/keyboard';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { NativeGeocoder } from '@ionic-native/native-geocoder'
import { NativeStorage } from '@ionic-native/native-storage';
import { ThemeableBrowser } from '@ionic-native/themeable-browser';

import { UshahidiApp } from './app.component';
import { BasePage } from '../pages/base-page/base-page';

import { DeploymentNonePage } from '../pages/deployment-none/deployment-none';
import { DeploymentSearchPage } from '../pages/deployment-search/deployment-search';
import { DeploymentDetailsPage } from '../pages/deployment-details/deployment-details';
import { UserLoginPage } from '../pages/user-login/user-login';
import { UserSignupPage } from '../pages/user-signup/user-signup';
import { DeploymentSettingsPage } from '../pages/deployment-settings/deployment-settings';

import { ResponseListPage } from '../pages/response-list/response-list';
import { ResponseDetailsPage } from '../pages/response-details/response-details';
import { ResponseAddPage } from '../pages/response-add/response-add';
import { ResponseMapPage } from '../pages/response-map/response-map';
import { ResponseSearchPage } from '../pages/response-search/response-search';
import { ResponseImagePage } from '../pages/response-image/response-image';

import { PrivacyPolicyPage } from '../pages/privacy-policy/privacy-policy';
import { WhitelabelIntroPage } from '../pages/whitelabel-intro/whitelabel-intro';

import { InputCheckboxComponent } from '../components/input-checkbox/input-checkbox';
import { InputCheckboxesComponent } from '../components/input-checkboxes/input-checkboxes';
import { InputDateComponent } from '../components/input-date/input-date';
import { InputDateTimeComponent } from '../components/input-datetime/input-datetime';
import { InputImageComponent } from '../components/input-image/input-image';
import { InputLocationComponent } from '../components/input-location/input-location';
import { InputNumberComponent } from '../components/input-number/input-number';
import { InputRadioComponent } from '../components/input-radio/input-radio';
import { InputSelectComponent } from '../components/input-select/input-select';
import { InputTextComponent } from '../components/input-text/input-text';
import { InputTextAreaComponent } from '../components/input-textarea/input-textarea';
import { InputVideoComponent } from '../components/input-video/input-video';
import { InputTagsComponent } from '../components/input-tags/input-tags';
import { InputMarkdownComponent } from '../components/input-markdown/input-markdown';
import { ImageCacheComponent } from '../components/image-cache/image-cache';
import { PostCardComponent } from '../components/post-card/post-card';
import { PostValueComponent } from '../components/post-value/post-value';

import { DateTimePipe } from '../pipes/date-time';
import { TimeAgoPipe } from '../pipes/time-ago';
import { TitleizePipe } from '../pipes/titleize';
import { CapitalizePipe } from '../pipes/capitalize';
import { TruncatePipe } from '../pipes/truncate';
import { HtmlStripPipe } from '../pipes/html-strip';
import { HtmlParsePipe } from '../pipes/html-parse';

import { LoggerService } from '../providers/logger-service';
import { ApiService } from '../providers/api-service';
import { DatabaseService } from '../providers/database-service';
import { CacheService } from '../providers/cache-service';
import { VimeoService } from '../providers/vimeo-service';
import { LanguageService } from '../providers/language-service';
import { SettingsService } from '../providers/settings-service';
import { GithubService } from '../providers/github-service';

export function translateLoaderFactory(http: Http) {
  return new TranslateStaticLoader(http, 'assets/i18n', '.json');
}

@Injectable()
export class GithubErrorHandler extends IonicErrorHandler implements ErrorHandler {
  constructor(private device:Device, private logger:LoggerService, private githubService:GithubService) {
    super();
  }

  handleError(error:any): void {
    this.logger.error(this, "handleError", "Error", error.name, "Message", error.message, "Stack", error.stack);
    // try {
    //   let title = [];
    //   let source = [];
    //   let body = [];
    //   if (error.name) {
    //     title.push(error.name);
    //   }
    //   if (error.message) {
    //     title.push(error.message);
    //   }
    //   if (this.device.manufacturer) {
    //     source.push(this.device.manufacturer);
    //   }
    //   if (this.device.platform) {
    //     source.push(this.device.platform);
    //   }
    //   if (this.device.version) {
    //     source.push(this.device.version);
    //   }
    //   if (this.device.model) {
    //     source.push(this.device.model);
    //   }
    //   if (source.length > 0) {
    //     body.push(source.join(" "));
    //   }
    //   if (error.stack) {
    //     body.push(" ");
    //     body.push(error.stack);
    //   }
    //   this.githubService.createIssueOrComment(title.join(" "), body.join("\n")).then((response:any) => {
    //     console.error("GithubErrorHandler Response " + response);
    //   },
    //   (error:any) => {
    //     console.error("GithubErrorHandler Error " + error);
    //   });
    // }
    // catch (err) {
    //   console.error("GithubErrorHandler Error " + err);
    // }
    super.handleError(error);
  }
}

@NgModule({
  declarations: [
    UshahidiApp,
    BasePage,
    DeploymentNonePage,
    DeploymentSearchPage,
    DeploymentDetailsPage,
    DeploymentSettingsPage,
    UserLoginPage,
    UserSignupPage,
    ResponseListPage,
    ResponseDetailsPage,
    ResponseAddPage,
    ResponseMapPage,
    ResponseImagePage,
    ResponseSearchPage,
    PrivacyPolicyPage,
    WhitelabelIntroPage,
    InputCheckboxComponent,
    InputCheckboxesComponent,
    InputDateComponent,
    InputDateTimeComponent,
    InputImageComponent,
    InputLocationComponent,
    InputNumberComponent,
    InputRadioComponent,
    InputSelectComponent,
    InputTextComponent,
    InputTextAreaComponent,
    InputVideoComponent,
    InputTagsComponent,
    InputMarkdownComponent,
    PostCardComponent,
    PostValueComponent,
    ImageCacheComponent,
    DateTimePipe,
    TimeAgoPipe,
    TitleizePipe,
    CapitalizePipe,
    TruncatePipe,
    HtmlStripPipe,
    HtmlParsePipe
  ],
  imports: [
    HttpModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MarkdownToHtmlModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: translateLoaderFactory,
      deps: [ Http ]
    }),
    IonicModule.forRoot(UshahidiApp, {
      backButtonText: '',
      scrollAssist: true,
      autoFocusAssist: true
     })
  ],
  bootstrap: [ IonicApp ],
  entryComponents: [
    UshahidiApp,
    DeploymentNonePage,
    DeploymentSearchPage,
    UserLoginPage,
    UserSignupPage,
    DeploymentDetailsPage,
    DeploymentSettingsPage,
    ResponseListPage,
    ResponseDetailsPage,
    ResponseAddPage,
    ResponseMapPage,
    ResponseImagePage,
    ResponseSearchPage,
    WhitelabelIntroPage,
    PrivacyPolicyPage
  ],
  providers: [
    { provide: File, useClass: File },
    { provide: SQLite, useClass: SQLite },
    { provide: Camera, useClass: Camera },
    { provide: Device, useClass: Device },
    { provide: IsDebug, useClass: IsDebug },
    { provide: Network, useClass: Network },
    { provide: Keyboard, useClass: Keyboard },
    { provide: FileTransfer, useClass: FileTransfer },
    { provide: StatusBar, useClass: StatusBar },
    { provide: AppVersion, useClass: AppVersion },
    { provide: Diagnostic, useClass: Diagnostic },
    { provide: Geolocation, useClass: Geolocation },
    { provide: SplashScreen, useClass: SplashScreen },
    { provide: ThemeableBrowser, useClass: ThemeableBrowser },
    { provide: MediaCapture, useClass: MediaCapture },
    { provide: SocialSharing, useClass: SocialSharing },
    { provide: NativeGeocoder, useClass: NativeGeocoder },
    { provide: GoogleAnalytics, useClass: GoogleAnalytics },
    { provide: NativeStorage, useClass: NativeStorage },
    { provide: ApiService, useClass: ApiService },
    { provide: VimeoService, useClass: VimeoService },
    { provide: CacheService, useClass: CacheService },
    { provide: LoggerService, useClass: LoggerService },
    { provide: DatabaseService, useClass: DatabaseService },
    { provide: LanguageService, useClass: LanguageService },
    { provide: TranslateService, useClass: TranslateService },
    { provide: SettingsService, useClass: SettingsService },
    { provide: GithubService, useClass: GithubService },
    { provide: ErrorHandler, useClass: GithubErrorHandler }
  ]
})
export class AppModule {}
