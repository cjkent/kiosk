import {InjectionToken, ModuleWithProviders, NgModule} from '@angular/core';
import {ChildStore, RootStore, Store} from './store';
import {CommonModule} from '@angular/common';

const childKeyToken = new InjectionToken('childKeyToken');
const initialStateToken = new InjectionToken('initialStateToken');

@NgModule({
  imports: [
    CommonModule
  ],
})
export class StoreModule {

  static forRoot(initialState: any): ModuleWithProviders<StoreModule> {
    return {
      ngModule: StoreModule,
      providers: [
        {
          provide: initialStateToken,
          useValue: initialState
        },
        {
          provide: Store,
          deps: [initialStateToken],
          useFactory: rootStoreFactory
        }
      ],
    };
  }

  static forFeature(key: string): ModuleWithProviders<StoreModule> {
    return {
      ngModule: StoreModule,
      providers: [
        {
          provide: childKeyToken,
          useValue: key
        },
        {
          provide: Store,
          deps: [Store, childKeyToken],
          useFactory: childStoreFactory
        }
      ],
    };
  }
}

export function childStoreFactory(store: Store<any>, key: string): ChildStore<any, any, any> {
  return new ChildStore(store, key);
}

export function rootStoreFactory(initialState: any): Store<any> {
  return new RootStore(initialState);
}
