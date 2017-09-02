import * as evmRelationship from '../action/evm-relationship.actions';
import {IServers, ServerId} from '../miq-types';

export interface MiqAppState {
  app: {
    originalServerId: ServerId;
    selectedServerId: ServerId;
    servers: IServers;
    loading: boolean;
    evmData?: any;
  };
}

export const INITIAL_STATE: MiqAppState = {
  app: {
  originalServerId: undefined,
  selectedServerId: undefined,
  servers: undefined,
  loading: false,
  evmData: undefined
  }
};

export function miqReducer(state = INITIAL_STATE, action: evmRelationship.EvmRelationshipActions): MiqAppState {
  console.log(`Reducer=>  type: ${action.type}`, action.payload);
  switch (action.type) {
    case evmRelationship.EVM_RELATIONSHIP_SERVER_LOAD : {
      return Object.assign({}, state,
        {originalServerId: action.payload.originalServerId, servers: undefined, loading: true});
    }

    case
    evmRelationship.EVM_RELATIONSHIP_SERVER_LOAD_SUCCESS : {
      return Object.assign({}, state,
        {servers: action.payload, loading: false});
    }

    case
    evmRelationship.EVM_RELATIONSHIP_SERVER_LOAD_FAIL : {
      return Object.assign({}, state,
        {servers: undefined, loading: false});
    }

    case evmRelationship.EVM_DATA_LOAD : {
      return Object.assign({}, state,
        {originalServerId: undefined, loading: true});
    }

    case
    evmRelationship.EVM_DATA_LOAD_SUCCESS : {
      return Object.assign({}, state,
        {evmData: action.payload, loading: false});
    }

    case
    evmRelationship.EVM_DATA_LOAD_FAIL : {
      return Object.assign({}, state,
        {loading: false});
    }

    case evmRelationship.EVM_DATA_SAVE : {
      return Object.assign({}, state,
        {originalServerId: action.payload.originalServerId, loading: true});
    }

    case
    evmRelationship.EVM_DATA_SAVE_SUCCESS : {
      return Object.assign({}, state,
        {servers: action.payload, loading: false});
    }

    case
    evmRelationship.EVM_DATA_SAVE_FAIL : {
      return Object.assign({}, state,
        {servers: undefined, loading: false});
    }
    case
    evmRelationship.CHANGE_SELECTED_SERVER_ID : {
      return Object.assign({}, state,
        {selectedServerId: action.payload});

    }
    default: {
      console.warn('Returning default state');
      return state;
    }
  }
}
