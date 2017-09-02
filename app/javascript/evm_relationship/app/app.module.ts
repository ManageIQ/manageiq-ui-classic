import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {EvmRelationshipComponent} from './evm-relationship/evm-relationship.component';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {EvmRelationshipEffects} from './evm-relationship/evm-relationship.effects';
import {EvmRelationshipService} from './evm-relationship/evm-relationship.service';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import {miqReducer} from "./reducer/reducer";
import {WindowService} from "./common/window-service";

const initialState = {counter: 0};

@NgModule({
  declarations: [
    AppComponent,
    EvmRelationshipComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    StoreModule.forRoot(<any>{app: miqReducer}, {initialState}),
    EffectsModule.forRoot([
      EvmRelationshipEffects
    ]),
  ],
  providers: [EvmRelationshipService, WindowService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
