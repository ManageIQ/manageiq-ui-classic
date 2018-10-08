export const prefix = '@@router-history/';

export const STORE_LAST_ACTION = `${prefix}Store last action`;
export const REMOVE_LAST_ACTION = `${prefix}Remove last action`;
export const REGISTER_CONTROLLER = `${prefix}Register controller`;

const initialState = {};

const historyReducer = (state = initialState, action) => {
  switch (action.type) {
    case STORE_LAST_ACTION:
      return { ...state, [state.activeController]: action.payload.route };
    case REMOVE_LAST_ACTION:
      return { ...state, [state.activeController]: undefined };
    case REGISTER_CONTROLLER:
      return { ...state, activeController: action.payload.controller };
    default:
      return state;
  }
};

export default historyReducer;
