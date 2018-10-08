import { push, replace, go, goBack, goForward } from 'connected-react-router';
import { STORE_LAST_ACTION, REMOVE_LAST_ACTION, REGISTER_CONTROLLER } from './history-reducer';

export const createReduxRoutingActions = ({ dispatch }) => ({
  push: (where) => {
    if (ManageIQ.redux.history.location.pathname !== where) {
      dispatch(push(where));
    }
  },
  replace: where => dispatch(replace(where)),
  go: howMany => dispatch(go(howMany)),
  goBack: () => dispatch(goBack()),
  goForward: () => dispatch(goForward()),
});

export const storeLastRoute = ({ route }) => ({
  type: STORE_LAST_ACTION,
  payload: {
    route,
  },
});

export const removeLastRoute = ({ controller }) => ({
  type: REMOVE_LAST_ACTION,
  payload: { controller },
});

export const registerController = ({ controller }) => ({
  type: REGISTER_CONTROLLER,
  payload: { controller },
});

export default createReduxRoutingActions;
