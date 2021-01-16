import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { DebugStore, RootStore, Store } from './store';

export type StoreType = 'standard' | 'debug';

export const INITIAL_STATE = new InjectionToken<unknown>('Initial State');
export const STORE_TYPE = new InjectionToken<StoreType>('Store Type');

export const INITIAL_CHILD_STATE = new InjectionToken<unknown>('Initial Child State');
export const CHILD_KEY = new InjectionToken<string>('Child Key');

export function createStore<T>(initialState: T, storeType: StoreType = 'standard'): Store<T> {
  switch (storeType) {
    case 'standard':
      console.log(`creating RootStore from initialState: ${JSON.stringify(initialState)}`);
      return new RootStore(initialState);
    case 'debug':
      console.log(`creating DebugStore from initialState: ${JSON.stringify(initialState)}`);
      return new DebugStore(initialState);
  }
}

export function createChildStore<T, K extends keyof T>(store: Store<T>, key: K, initialState: T[K]): Store<T[K]> {
  console.log(`creating child store from initialState: ${JSON.stringify(initialState)}`);
  store.apply(state => {
    const stateCopy = { ...state };
    stateCopy[key] = initialState;
    return stateCopy;
  });
  return store.child(key);
}

@NgModule()
export class StoreModule {

  static forRoot<T>(initialState: T, storeType: StoreType = 'standard'): ModuleWithProviders<StoreModule> {
    return {
      ngModule: StoreModule,
      providers: [
        {
          provide: INITIAL_STATE,
          useValue: initialState
        },
        {
          provide: STORE_TYPE,
          useValue: storeType
        },
        {
          provide: Store,
          useFactory: createStore,
          deps: [INITIAL_STATE, STORE_TYPE]
        }
      ]
    };
  }

  static forFeature(key: string, initialState: unknown): ModuleWithProviders<StoreModule> {
    return {
      ngModule: StoreModule,
      providers: [
        {
          provide: INITIAL_CHILD_STATE,
          useValue: initialState
        },
        {
          provide: CHILD_KEY,
          useValue: key
        },
        {
          provide: Store,
          useFactory: createChildStore,
          deps: [Store, CHILD_KEY, INITIAL_CHILD_STATE]
        }
      ]
    };
  }
}
