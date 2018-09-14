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

  apply(actionFn: (state: T) => T) {
    this.state = actionFn(this.state);
    this.emitter.next(this.state);
  }

  select<U>(selectorFn: (state: T) => U): Observable<U> {
    return this.emitter.pipe(map(state => selectorFn(state), distinctUntilChanged()));
  }

  run(task: (state: T) => void) {
    task(this.state);
  }

  update<K extends keyof T>(key: K, value: T[K]) {
    // Safe to ignore as the signature means this can only be called when the state is an object
    // @ts-ignore
    this.state = update(this.state, key, value);
    this.emitter.next(this.state);
  }

  child<K extends keyof T>(key: K): Store<T[K]> {
    // TODO this is obviously not the final impl - just checking the typing
    // TODO create ChildStore subtype? how would applying actions work?
    // apply the action this this store's state and then call parentStore.update(key, newChildState)?
    return new Store(this.state[key]);
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

export function update<T extends object, K extends keyof T>(obj: T, key: K, value: T[K]) {
  // Safe to ignore as the signature means this can only be called when the state is an object
  const newObj = {...obj as object} as T;
  newObj[key] = value;
  return newObj;
}
