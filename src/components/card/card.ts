import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'response-card',
  templateUrl: 'card.html',
  inputs: ['response', 'index']
})
export class CardComponent {

  @Output() cardSelected = new EventEmitter();
  @Output() menuSelected = new EventEmitter();

  index: number = 0;
  response: any = {};
  offset: number = 1000;
  placeholderUser: string = "assets/images/placeholder-user.jpg";
  placeholderPhoto: string = "assets/images/placeholder-photo.jpg";
  imageUser: string = "https://www.gravatar.com/avatar/74a8d7dadabcd2ac5c45f68e5a53cedf.jpg?s=32";
  imagePhoto: string = "http://lorempixel.com/400/200/sports/1";

  constructor() {
    console.log('Card Component');
  }

  ngOnInit() {
  }

  onCardSelected(event) {
    console.log('Card cardSelected');
    this.cardSelected.emit();
  }

  onMenuSelected(event) {
    console.log('Card menuSelected');
    this.menuSelected.emit();
  }
}
