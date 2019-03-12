import {Component} from '@angular/core';
import {KioskState, Text2State} from '../store/state';
import {Store} from '../store/store';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-text2',
  templateUrl: './text2.component.html',
  styleUrls: ['./text2.component.css']
})
export class Text2Component {

  private store: Store<Text2State>;
  text2$: Observable<string>;

  constructor(store: Store<KioskState>) {
    this.store = store.child('textState').child('text2State');
    this.text2$ = this.store.select('text2');
  }

  onSet(value: string) {
    this.store.update('text2', value);
  }
}
