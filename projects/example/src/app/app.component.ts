import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Action, RootStore, Store, update } from 'store';
import { KioskState } from './store/state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  value$: Observable<number>;
  store: Store<KioskState>;

  constructor(store: Store<KioskState>) {
    console.log(`store = ${JSON.stringify(store)}`);
    this.store = store;
    this.value$ = store.select('value');
    // this.value$ = store.select(state => state.value);
  }

  onClick(): void {
    this.store.dispatch(new IncrementAction());
  }

  onAdd(val: string): void {
    const valueNum = parseFloat(val);
    this.store.apply(state => update(state, 'value', valueNum + state.value));
    // this.store.apply(state => ({...state, value: valueNum + state.value}));
  }

  onSet(val: string): void {
    const valueNum = parseFloat(val);
    this.store.update('value', valueNum);
  }
}

class IncrementAction implements Action<KioskState> {
  reduce(state: KioskState): KioskState {
    return update(state, 'value', state.value + 1);
  }
}
