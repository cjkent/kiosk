import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {DebugStore, Store} from './store/store';
import {INITIAL_STATE} from './store/state';
import {TextComponent} from './text/text.component';
import {Text2Component} from './text2/text2.component';

@NgModule({
  declarations: [
    AppComponent,
    TextComponent,
    Text2Component
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
  // return new RootStore(INITIAL_STATE);
}
