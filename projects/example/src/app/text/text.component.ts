import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from 'store';
import { KioskState, TextState } from '../store/state';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.css']
})
export class TextComponent {

  text$: Observable<string>;
  store: Store<TextState>;

  constructor(store: Store<KioskState>) {
    this.store = store.child('textState');
    this.text$ = this.store.select('text');
  }

  onSet(value: string): void {
    this.store.update('text', value);
  }
}
