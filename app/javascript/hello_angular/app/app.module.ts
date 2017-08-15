import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';


import { WidgetMenu } from './widget_menu';


@NgModule({
  declarations: [
    WidgetMenu
  ],
  imports: [
    BrowserModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [WidgetMenu]
})
export class AppModule { }
