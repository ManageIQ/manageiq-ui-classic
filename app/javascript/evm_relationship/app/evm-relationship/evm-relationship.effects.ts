import {Injectable} from '@angular/core';
import {Actions, Effect} from '@ngrx/effects';
import {Observable} from 'rxjs/Observable';
import {EvmRelationshipService} from './evm-relationship.service';
import * as evmRelationship from '../action/evm-relationship.actions';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';

@Injectable()
export class EvmRelationshipEffects {
  constructor(private evmRelationshipService: EvmRelationshipService,
              private actions$: Actions) {
  }

  @Effect() evmRelationshipServerLoadEffect$ = this.actions$
    .ofType(evmRelationship.EVM_RELATIONSHIP_SERVER_LOAD)
    .switchMap(payload => this.evmRelationshipService.getServersList()
      .do(val => console.log('EvmServerEffect: ', val))
      // If successful, dispatch success action with result
      .map(res => ({type: evmRelationship.EVM_RELATIONSHIP_SERVER_LOAD_SUCCESS, payload: res}))
      // If request fails, dispatch failed action
      .catch(() => Observable.of({type: evmRelationship.EVM_RELATIONSHIP_SERVER_LOAD_FAIL}))
    );

  @Effect() evmDataLoadEffect$ = this.actions$
    .ofType(evmRelationship.EVM_DATA_LOAD)
    .switchMap(payload => this.evmRelationshipService.getEvmData(payload.evmRelationshipFormId)
      .do(val => console.log('EvmDataEffect: ', val))
      // If successful, dispatch success action with result
      .map(res => ({type: evmRelationship.EVM_DATA_LOAD_SUCCESS, payload: res}))
      // If request fails, dispatch failed action
      .catch(() => Observable.of({type: evmRelationship.EVM_DATA_LOAD_FAIL}))
    );

  @Effect() evmDataSaveEffect$ = this.actions$
    .ofType(evmRelationship.EVM_DATA_SAVE)
    .switchMap(payload => this.evmRelationshipService.saveEvmServerRelationship(payload.id,payload)
      .do(val => console.log('EvmDataSaveEffect: ', val))
      // If successful, dispatch success action with result
      .map(res => ({type: evmRelationship.EVM_DATA_SAVE_SUCCESS, payload: res}))
      // If request fails, dispatch failed action
      .catch(() => Observable.of({type: evmRelationship.EVM_DATA_SAVE_FAIL}))
    );
}
