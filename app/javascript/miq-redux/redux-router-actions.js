import {
  push,
  replace,
  go,
  goBack,
  goForward,
} from 'connected-react-router';

const createReduxRoutingActions = ({ dispatch }) => ({
  push: where => dispatch(push(where)),
  replace: where => dispatch(replace(where)),
  go: howMany => dispatch(go(howMany)),
  goBack: () => dispatch(goBack()),
  goForward: () => dispatch(goForward()),
});

export default createReduxRoutingActions;
