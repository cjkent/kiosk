import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {INITIAL_STATE} from './store/state';
import {TextComponent} from './text/text.component';
import {Text2Component} from './text2/text2.component';
import {StoreModule} from './store/module';

@NgModule({
  declarations: [
    AppComponent,
    TextComponent,
    Text2Component
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot(INITIAL_STATE),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
