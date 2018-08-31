import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {DebugStore, Store} from './store/store';
import {INITIAL_STATE} from './store/state';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    {provide: Store, useFactory: createStore}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function createStore() {
  return new DebugStore(INITIAL_STATE);
  // return new Store(INITIAL_STATE);
}
