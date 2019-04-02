import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TextComponent } from './text/text.component';
import { Text2Component } from './text2/text2.component';
import { StoreModule } from '../../../src/store';
import { INITIAL_STATE } from './store/state';

@NgModule({
  declarations: [
    AppComponent,
    TextComponent,
    Text2Component
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot(INITIAL_STATE)
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
