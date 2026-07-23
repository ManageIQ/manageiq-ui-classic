import { history } from '../miq-component/react-history.js';

const createReduxRoutingActions = ({ dispatch }) => ({
  push: (where) => dispatch({ type: '@@router/NAVIGATE', payload: { method: 'push', args: [where] } }),
  replace: (where) => dispatch({ type: '@@router/NAVIGATE', payload: { method: 'replace', args: [where] } }),
  go: (howMany) => dispatch({ type: '@@router/NAVIGATE', payload: { method: 'go', args: [howMany] } }),
  goBack: () => dispatch({ type: '@@router/NAVIGATE', payload: { method: 'back', args: [] } }),
  goForward: () => dispatch({ type: '@@router/NAVIGATE', payload: { method: 'forward', args: [] } }),
});

export default createReduxRoutingActions;
