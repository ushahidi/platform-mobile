import { Component, Input, Output, EventEmitter } from '@angular/core';

import { MarkdownToHtmlPipe } from 'markdown-to-html-pipe';
import { TruncatePipe } from '../../pipes/truncate';
import { HtmlParsePipe } from '../../pipes/html-parse';

import { LanguageService } from '../../providers/language-service';

@Component({
  selector: 'text-more',
  templateUrl: 'text-more.html',
  providers: [ MarkdownToHtmlPipe, TruncatePipe, HtmlParsePipe, LanguageService ],
})
export class TextMoreComponent {

  @Input()
  text:string = "";

  @Input()
  direction:string = "ltr";

  @Input()
  truncate:number = 20;

  @Output()
  handleLinks = new EventEmitter();

  truncated:boolean = false;

  html:string = "";

  constructor(
    private markdownPipe:MarkdownToHtmlPipe,
    private truncatePipe:TruncatePipe,
    private htmlPipe:HtmlParsePipe,
    private language:LanguageService) {
  }

  ngOnInit() {
    this.language.getTranslation('ACTION_READ_MORE').then((translation:string) => {
      if (this.text && this.text.length > 0) {
        let words = this.text.split(" ");
        if (words.length > this.truncate) {
          let markdown = this.markdownPipe.transform(this.text);
          let html = this.htmlPipe.transform(markdown, []);
          let truncated = this.truncatePipe.transform(html, 20);
          this.html = truncated + `<a class="more" ion-text color="dark" tappable (click)="readMore($event)">...${translation}</a>`;
          this.truncated = true;
        }
        else {
          let markdown = this.markdownPipe.transform(this.text);
          this.html = this.htmlPipe.transform(markdown, []);
          this.truncated = false;
        }
      }
      else {
        this.html = "";
        this.truncated = false;
      }
    });
  }

  readMore(event:any) {
    if (this.truncated) {
      let markdown = this.markdownPipe.transform(this.text);
      this.html = this.htmlPipe.transform(markdown, []);
      this.truncated = false;
    }
    else {
      this.handleLinks.emit(event);
    }
    event.stopPropagation();
    return false;
  }

}
