import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {DebugStore, Store} from './store/store';
import {INITIAL_STATE} from './store/state';
import {TextComponent} from './text/text.component';

@NgModule({
  declarations: [
    AppComponent,
    TextComponent
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
  // return new BaseStore(INITIAL_STATE);
}
