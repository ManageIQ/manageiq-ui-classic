import FormButtons from './form-buttons';

const REDUX_FORM_BUTTON_INIT = 'FormButtons.init';
const REDUX_FORM_BUTTON_CUSTOM_LABEL = 'FormButtons.customLabel';
const REDUX_FORM_BUTTON_NEW_RECORD = 'FormButtons.newRecord';
const REDUX_FORM_BUTTON_PRISTINE = 'FormButtons.pristine';
const REDUX_FORM_BUTTON_SAVEABLE = 'FormButtons.saveable';
const REDUX_FORM_BUTTON_CALLBACKS = 'FormButtons.callbacks';

export const formButtonsActions = {
  REDUX_FORM_BUTTON_INIT,
  REDUX_FORM_BUTTON_CUSTOM_LABEL,
  REDUX_FORM_BUTTON_NEW_RECORD,
  REDUX_FORM_BUTTON_PRISTINE,
  REDUX_FORM_BUTTON_SAVEABLE,
  REDUX_FORM_BUTTON_CALLBACKS,
};

const formsButtonsActions = {
  [REDUX_FORM_BUTTON_INIT]: (_state, payload) => ({ ...FormButtons.defaultProps, ...payload }),
  [REDUX_FORM_BUTTON_CUSTOM_LABEL]: (state, payload) => ({ ...state, customLabel: payload || '' }),
  [REDUX_FORM_BUTTON_NEW_RECORD]: (state, payload) => ({ ...state, newRecord: !!payload }),
  [REDUX_FORM_BUTTON_PRISTINE]: (state, payload) => ({ ...state, pristine: !!payload }),
  [REDUX_FORM_BUTTON_SAVEABLE]: (state, payload) => ({ ...state, saveable: !!payload }),
  [REDUX_FORM_BUTTON_CALLBACKS]: (state, payload) => ({ ...state, ...payload }),
};

export default (state = FormButtons.defaultProps, action) => {
  const mutator = formsButtonsActions[action.type];
  return mutator ? mutator(state, action.payload) : state;
};

