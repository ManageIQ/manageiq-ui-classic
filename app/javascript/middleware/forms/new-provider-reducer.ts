import { UPDATE_FORM, INIT_FORM } from '../../miq-redux/lib';
import { AppState, IMiqReducerHash } from '../../miq-redux/redux-types';
import { merge, defaultsDeep } from 'lodash';

function initNewProvider(state, action): AppState {
  const newProvider = {
    providers: {
      middleware: {
        hawkular: {
          newProvider: {
            type: undefined,
            zone: 'default',
            protocol: undefined
          }
        }
      }
    }
  };
  return { ...defaultsDeep(state, newProvider) }
}

function updateNewProvider(state, action): AppState {
  const newProvider = {
    providers: {
      middleware: {
        hawkular: {
          newProvider: {...action.payload}
        }
      }
    }
  };

  return { ...merge(state, newProvider) }
}

export const reducers: IMiqReducerHash = {
  [INIT_FORM]: initNewProvider,
  [UPDATE_FORM]: updateNewProvider
};
