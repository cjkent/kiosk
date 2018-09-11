import {Component} from '@angular/core';
import {Action, Store} from './store/store';
import {KioskState} from './store/state';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  value$: Observable<number>;
  store: Store<KioskState>;

  constructor(store: Store<KioskState>) {
    this.store = store;
    this.value$ = store.select(state => state.value);
  }

  onClick() {
    this.store.dispatch(new IncrementAction());
  }

  onAdd(value: string) {
    this.store.run(state => {
      const newValue = state.value + parseFloat(value);
      this.store.dispatch(new ValueAction(newValue));
    });
  }
}

class IncrementAction implements Action<KioskState> {
  reduce(state: KioskState): KioskState {
    return {
      ...state,
      value: state.value + 1,
    };
  }
}

class ValueAction implements Action<KioskState> {

  constructor(private value: number) {}

  reduce(state: KioskState): KioskState {
    return {
      ...state,
      value: this.value,
    };
  }
}
