import {BehaviorSubject, Observable} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';

export interface Action<T> {
  reduce(state: T): T;
}

export class Store<T> {

  private readonly emitter: BehaviorSubject<T>;

  constructor(protected state: T) {
    this.emitter = new BehaviorSubject(state);
  }

  dispatch(action: Action<T>) {
    this.state = action.reduce(this.state);
    this.emitter.next(this.state);
  }

  select<U>(selectorFn: (state: T) => U): Observable<U> {
    return this.emitter.pipe(map(state => selectorFn(state), distinctUntilChanged()));
  }
}

export class DebugStore<T> extends Store<T> {

  constructor(state: T) {
    super(state);
    console.info('Store created', state);
  }

  dispatch(action: Action<T>) {
    super.dispatch(action);
    console.info('Dispatched action', action);
    console.info('New state', this.state);
  }
}
