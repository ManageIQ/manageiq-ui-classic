import FormButtons from './form-buttons';

export const formButtonsActionTypes = {
  init: 'FormButtons.init',
  customLabel: 'FormButtons.customLabel',
  newRecord: 'FormButtons.newRecord',
  pristine: 'FormButtons.pristine',
  saveable: 'FormButtons.saveable',
  callbacks: 'FormButtons.callbacks',
};

const formsButtonsActions = {
  [formButtonsActionTypes.init]: (_state, payload) => ({ ...FormButtons.defaultProps, ...payload }),
  [formButtonsActionTypes.customLabel]: (state, payload) => ({ ...state, customLabel: payload || '' }),
  [formButtonsActionTypes.newRecord]: (state, payload) => ({ ...state, newRecord: !!payload }),
  [formButtonsActionTypes.pristine]: (state, payload) => ({ ...state, pristine: !!payload }),
  [formButtonsActionTypes.saveable]: (state, payload) => ({ ...state, saveable: !!payload }),
  [formButtonsActionTypes.callbacks]: (state, payload) => ({ ...state, ...payload }),
};

export const createFormButtonsActions = ({ dispatch }) =>
  Object.keys(formButtonsActionTypes).reduce((acc, key) => ({
    ...acc,
    [key]: payload => dispatch({ type: formButtonsActionTypes[key], payload }),
  }), {});

export default (state = FormButtons.defaultProps, action) => {
  const mutator = formsButtonsActions[action.type];
  return mutator ? mutator(state, action.payload) : state;
};
