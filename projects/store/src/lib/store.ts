import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

export interface Action<T> {
  reduce(state: T): T;
}

export abstract class Store<T> {

  abstract dispatch(action: Action<T>): void;

  abstract apply(actionFn: (state: T) => T): void;

  abstract select(): Observable<T>;
  abstract select<K extends keyof T>(key: K): Observable<T[K]>;
  abstract select<U>(selectorFn: (state: T) => U): Observable<U>;

  abstract run(task: (state: T) => void): void;

  abstract update<K extends keyof T>(key: K, value: T[K]): void;

  abstract child<K extends keyof T>(key: K): Store<T[K]>;
}


export class RootStore<T> extends Store<T> {

  private readonly emitter: BehaviorSubject<T>;

  constructor(protected state: T) {
    super();
    this.emitter = new BehaviorSubject(state);
  }

  protected setState(state: T): void {
    this.state = state;
    this.emitter.next(this.state);
  }

  dispatch(action: Action<T>): void {
    this.state = action.reduce(this.state);
    this.emitter.next(this.state);
  }

  apply(actionFn: (state: T) => T): void {
    this.state = actionFn(this.state);
    this.emitter.next(this.state);
  }

  select(): Observable<T>;
  select<K extends keyof T>(): Observable<T[K]>;
  select<U>(selectorFn: (state: T) => U): Observable<U>;

  select(arg?: ((state: T) => unknown | keyof T)): Observable<unknown> | Observable<T> {
    if (!arg) {
      return this.emitter;
    }
    if (this.keyGuard(arg)) {
      return this.emitter.pipe(map(state => state[arg], distinctUntilChanged()));
    }
    return this.emitter.pipe(map(arg, distinctUntilChanged()));
  }

  private keyGuard(arg: unknown): arg is keyof T {
    return typeof arg === 'string';
  }

  run(task: (state: T) => void): void {
    task(this.state);
  }

  update<K extends keyof T>(key: K, value: T[K]): void {
    this.state = update(this.state, key, value);
    this.emitter.next(this.state);
  }

  child<K extends keyof T>(key: K): Store<T[K]> {
    // TODO is this safe? Can I make the signatures work?
    // @ts-ignore
    return new ChildStore(this, key);
  }
}

export class DebugStore<T> extends RootStore<T> {

  constructor(state: T) {
    super(state);
    console.info('Store created', state);
  }

  dispatch(action: Action<T>): void {
    super.dispatch(action);
    console.info('Dispatched action', action);
    console.info('New state after dispatch', this.state);
  }

  apply(actionFn: (state: T) => T): void {
    super.apply(actionFn);
    console.info('New state after apply', this.state);
  }

  update<K extends keyof T>(key: K, value: T[K]): void {
    super.update(key, value);
    console.info('New state after update', this.state);
  }
}

export class ChildStore<P, PK extends keyof P> extends Store<P[PK]> {

  constructor(private parent: Store<P>, private key: PK) {
    super();
  }

  apply(actionFn: (state: P[PK]) => P[PK]): void {
    this.parent.run(parentState => {
      const state = parentState[this.key];
      const newState = actionFn(state);
      this.parent.update(this.key, newState);
    });
  }

  child<K extends keyof P[PK]>(key: K): Store<P[PK][K]> {
    // TODO can this be made to type check?
    // @ts-ignore
    return new ChildStore(this, key);
  }

  dispatch(action: Action<P[PK]>): void {
    this.parent.run(parentState => {
      const state = parentState[this.key];
      const newState = action.reduce(state);
      this.parent.update(this.key, newState);
    });
  }

  run(task: (state: P[PK]) => void): void {
    this.parent.run(parentState => {
      const state = parentState[this.key];
      task(state);
    });
  }

  select(): Observable<P[PK]>;
  select<K extends keyof P[PK]>(): Observable<P[PK][K]>;
  select<U>(selectorFn: (state: P[PK]) => U): Observable<U>;

  select(arg?: ((state: P[PK]) => unknown | keyof P[PK])): Observable<unknown> | Observable<P[PK]> {
    if (!arg) {
      return this.parent.select(this.key);
    }
    if (this.keyGuard(arg)) {
      return this.parent.select(this.key).pipe(map(state => state[arg], distinctUntilChanged()));
    }
    return this.parent.select(this.key).pipe(map(arg), distinctUntilChanged());
  }

  private keyGuard(arg: keyof P[PK] | unknown): arg is keyof P[PK] {
    return typeof arg === 'string';
  }

  update<K extends keyof P[PK]>(key: K, value: P[PK][K]): void {
    this.parent.run(parentState => {
      const state = parentState[this.key];
      const newState = update(state, key, value);
      this.parent.update(this.key, newState);
    });
  }
}

export function update<T, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  // Safe to ignore as the signature means this can only be called when the state is an object
  // @ts-ignore
  const newObj = { ...obj };
  newObj[key] = value;
  return newObj;
}

// TODO this captures updates in the root store
//   would it be better to get the property name at the highest level?
//   does there need to be a redux child store?
export class ReduxDevtoolsStore<T> extends RootStore<T> {

  // @ts-ignore
  private devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({});

  constructor(state: T) {
    super(state);
    this.devTools.init(state);
    // tslint:disable-next-line:no-any
    this.devTools.subscribe((message: any) => {
      if (message.type === 'DISPATCH' &&
        (message.payload.type === 'JUMP_TO_ACTION' || message.payload.type === 'JUMP_TO_STATE')) {

        this.setState(JSON.parse(message.state));
      } else {
        console.log('message received', message);
      }
    });
  }

  apply(actionFn: (state: T) => T): void {
    super.apply(actionFn);
    this.devTools.send(this.actionName(), this.state);
  }

  dispatch(action: Action<T>): void {
    super.dispatch(action);
    this.devTools.send(this.actionName(), this.state);
  }

  update<K extends keyof T>(key: K, value: T[K]): void {
    super.update(key, value);
    this.devTools.send(`update ${key}`, this.state);
  }

  private actionName(): string {
    const stack = new Error().stack;
    const stackLines = stack!.split(/\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => line.indexOf('Error') === -1)
      .filter(line => line.indexOf('ReduxDevtoolsStore') === -1);
    const firstLine = stackLines[0] || 'unknown';
    return firstLine
      .replace(/\s*at\s*/g, '')
      .replace(/\(.*\)/g, '')
      .replace(/.*\//g, '');
  }
}
