import {distinctUntilChanged, map} from 'rxjs/Operators';
import {BehaviorSubject, Observable} from 'rxjs';

export interface Action<T> {
  reduce(state: T): T;
}

export abstract class Store<T extends object> {

  abstract dispatch(action: Action<T>);

  abstract apply(actionFn: (state: T) => T);

  abstract select<U>(selectorFn: (state: T) => U): Observable<U>;

  abstract selectProperty<K extends keyof T>(key: K): Observable<T[K]>;

  abstract run(task: (state: T) => void);

  abstract update<K extends keyof T>(key: K, value: T[K]);

  abstract child<K extends keyof T>(key: K): Store<T[K]>;
}


export class RootStore<T extends object> extends Store<T> {

  private readonly emitter: BehaviorSubject<T>;

  constructor(protected state: T) {
    super();
    this.emitter = new BehaviorSubject(state);
  }

  protected setState(state: T) {
    this.state = state;
    this.emitter.next(this.state);
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

  selectProperty<K extends keyof T>(key: K): Observable<T[K]> {
    return this.emitter.pipe(map(state => state[key], distinctUntilChanged()));
  }

  run(task: (state: T) => void) {
    task(this.state);
  }

  update<K extends keyof T>(key: K, value: T[K]) {
    this.state = update(this.state, key, value);
    this.emitter.next(this.state);
  }

  child<K extends keyof T>(key: K): Store<T[K]> {
    // TODO is this safe? Can I make the signatures work?
    // @ts-ignore
    return new ChildStore(this, key);
  }
}

export class DebugStore<T extends object> extends RootStore<T> {

  constructor(state: T) {
    super(state);
    console.info('Store created', state);
  }

  dispatch(action: Action<T>) {
    super.dispatch(action);
    console.info('Dispatched action', action);
    console.info('New state after dispatch', this.state);
  }

  apply(actionFn: (state: T) => T) {
    super.apply(actionFn);
    console.info('New state after apply', this.state);
  }

  update<K extends keyof T>(key: K, value: any) {
    super.update(key, value);
    console.info('New state after update', this.state);
  }
}

export class ChildStore<T extends object, P extends { [U in PK]: T } & object, PK extends keyof P> extends Store<T> {

  constructor(private parent: Store<P>, private key: PK) {
    super();
  }

  apply(actionFn: (state: T) => T) {
    this.parent.run(parentState => {
      const state = parentState[this.key];
      const newState = actionFn(state);
      this.parent.update(this.key, newState);
    });
  }

  child<K extends keyof T>(key: K): Store<T[K]> {
    // TODO can this be made to type check?
    // @ts-ignore
    return new ChildStore(this, key);
  }

  dispatch(action: Action<T>) {
    this.parent.run(parentState => {
      const state = parentState[this.key];
      const newState = action.reduce(state);
      this.parent.update(this.key, newState);
    });
  }

  run(task: (state: T) => void) {
    this.parent.run(parentState => {
      const state = parentState[this.key];
      task(state);
    });
  }

  select<U>(selectorFn: (state: T) => U): Observable<U> {
    return this.parent.selectProperty(this.key).pipe(map(selectorFn));
  }

  selectProperty<K extends keyof T>(key: K): Observable<T[K]> {
    return this.parent.selectProperty(this.key).pipe(map(value => value[key]));
  }

  update<K extends keyof T>(key: K, value: T[K]) {
    this.parent.run(parentState => {
      const state = parentState[this.key];
      const newState = update(state, key, value);
      this.parent.update(this.key, newState);
    });
  }
}

export function update<T extends object, K extends keyof T>(obj: T, key: K, value: T[K]) {
  // Safe to ignore as the signature means this can only be called when the state is an object
  const newObj = {...obj as object} as T;
  newObj[key] = value;
  return newObj;
}

export class ReduxDevtoolsStore<T extends object> extends RootStore<T> {

  private regex = /.*?(\w+\.\w+ \(.+\))/;

  // @ts-ignore
  private devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({});

  constructor(state: T) {
    super(state);
    this.devTools.init(state);
    this.devTools.subscribe(message => {
      if (message.type === 'DISPATCH' &&
        (message.payload.type === 'JUMP_TO_ACTION' || message.payload.type === 'JUMP_TO_STATE')) {

        this.setState(JSON.parse(message.state));
      } else {
        console.log('message received', message);
      }
    });
  }

  apply(actionFn: (state: T) => T) {
    super.apply(actionFn);
    this.devTools.send(this.actionName(), this.state);
  }

  dispatch(action: Action<T>) {
    super.dispatch(action);
    this.devTools.send(this.actionName(), this.state);
  }

  update<K extends keyof T>(key: K, value: any) {
    super.update(key, value);
    this.devTools.send(this.actionName(), this.state);
  }

  private actionName(): string {
    const stack = new Error().stack;
    const stackLines = stack.split(/\n/);
    const line = stackLines[3];
    const result = this.regex.exec(line);
    if (result) {
      return result[1];
    } else {
      console.log(stackLines);
      return 'unknown';
    }
  }
}
