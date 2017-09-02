import {Action} from '@ngrx/store';
import {ServerId} from '../miq-types';

export const EVM_RELATIONSHIP_SERVER_LOAD = '[Evm Relationship] Server Load';
export const EVM_RELATIONSHIP_SERVER_LOAD_SUCCESS = '[Evm Relationship] Server Load Success';
export const EVM_RELATIONSHIP_SERVER_LOAD_FAIL = '[Evm Relationship] Server Load Fail';

export const EVM_DATA_LOAD = '[Evm Data] Load';
export const EVM_DATA_LOAD_SUCCESS = '[Evm Data] Load Success';
export const EVM_DATA_LOAD_FAIL = '[Evm Data] Load Fail';

export const EVM_DATA_SAVE = '[Evm Data] Save';
export const EVM_DATA_SAVE_SUCCESS = '[Evm Data] Save Success';
export const EVM_DATA_SAVE_FAIL = '[Evm Data] Save Fail';

// Actions for the screen
export const CHANGE_SELECTED_SERVER_ID = '[Evm Relationship] Change SelectedServerId';

/**
 * Load Evm Relationship Actions
 */
export class EvmRelationshipServerLoadAction implements Action {
  readonly type = EVM_RELATIONSHIP_SERVER_LOAD;
  public payload: any;
  constructor(private originalServerId: ServerId) {
    this.payload = {originalServerId};
  }
}

export class EvmRelationshipServerLoadSuccessAction implements Action {
  readonly type = EVM_RELATIONSHIP_SERVER_LOAD_SUCCESS;

  constructor(public payload: any) {
  }
}

export class EvmRelationshipServerLoadFailAction implements Action {
  readonly type = EVM_RELATIONSHIP_SERVER_LOAD_FAIL;

  constructor(public payload: any) {
  }
}

export class EvmDataLoadAction implements Action {
  readonly type = EVM_DATA_LOAD;
  public payload: any;
  constructor(private evmRelationshipFormId: ServerId) {
    this.payload = {evmRelationshipFormId};
  }
}

export class EvmDataLoadSuccessAction implements Action {
  readonly type = EVM_DATA_LOAD_SUCCESS;
  constructor(public payload: any) {
  }
}

export class EvmDataLoadFailAction implements Action {
  readonly type = EVM_DATA_LOAD_FAIL;
  constructor(public payload: any) {
  }
}

export class EvmRelationshipDataSaveAction implements Action {
  readonly type = EVM_DATA_SAVE;
  public payload: any;
  constructor(private originalServerId: ServerId) {
    this.payload = {originalServerId};
  }
}

export class EvmDataSaveSuccessAction implements Action {
  readonly type = EVM_DATA_SAVE_SUCCESS;
  constructor(public payload: any) {
  }
}

export class EvmDataSaveFailAction implements Action {
  readonly type = EVM_DATA_SAVE_FAIL;
  constructor(public payload: any) {
  }
}

export class ChangeSelectedServerIdAction implements Action {
  readonly type = CHANGE_SELECTED_SERVER_ID;
  public payload: any;
  constructor(private selectedServerId: ServerId) {
    this.payload = {selectedServerId};
  }
}

export type EvmRelationshipActions =
  | EvmRelationshipServerLoadAction
  | EvmRelationshipServerLoadSuccessAction
  | EvmRelationshipServerLoadFailAction
  | EvmDataLoadAction
  | EvmDataLoadSuccessAction
  | EvmDataLoadFailAction
  | EvmRelationshipDataSaveAction
  | EvmDataSaveSuccessAction
  | EvmDataSaveFailAction
  | ChangeSelectedServerIdAction;
